/* eslint-disable no-case-declarations */
import { AttachmentBuilder, CommandInteraction, SlashCommandBuilder } from "discord.js"
import RE2 from "re2"
import util from "../utilities/general"
import { BlacklistReasonKey, BlacklistReasonKeys, BlacklistTarget } from "../types/apis"
import axios from "axios"
import { log } from "../services/logger"
import AntiPhishUtil from "../utilities/antiphish"
import Security from "../services/security"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("bulk")
		.setDescription("Preforms a action in bulk.")
		.setDMPermission(false)
		.addSubcommand(SlashCommandSubcommandBuilder =>
			SlashCommandSubcommandBuilder
				.setName("blacklist-guilds")
				.setDescription("Blacklists the specified guilds.")
				.addStringOption(SlashCommandStringOption =>
					SlashCommandStringOption
						.setName("guilds")
						.setDescription("The guilds to blacklist. Format 'invite/id reason-key, invite/id reason-key, invite/id reason-key'.")
						.setRequired(true)
				)
		)
		.addSubcommand(SlashCommandSubcommandBuilder =>
			SlashCommandSubcommandBuilder
				.setName("defang")
				.setDescription("Defangs the specified URLs.")
				.addStringOption(SlashCommandStringOption =>
					SlashCommandStringOption
						.setName("urls")
						.setDescription("The URLs to defang. Format 'url url url'.")
						.setRequired(true)
				)
		)
		.addSubcommand(SlashCommandSubcommandBuilder =>
			SlashCommandSubcommandBuilder
				.setName("extract-ids")
				.setDescription("Extracts IDs from the specified string.")
				.addStringOption(SlashCommandStringOption =>
					SlashCommandStringOption
						.setName("string")
						.setDescription("The string to extract IDs from.")
						.setRequired(true)
				)
		)
		.addSubcommand(SlashCommandSubcommandBuilder =>
			SlashCommandSubcommandBuilder
				.setName("get-creation-dates")
				.setDescription("Gets the creation dates of the specified IDs.")
				.addStringOption(SlashCommandStringOption =>
					SlashCommandStringOption
						.setName("ids")
						.setDescription("The IDs to get creation dates for. Format 'id id id'.")
						.setRequired(false)
				)
				.addAttachmentOption(SlashCommandAttachmentOption =>
					SlashCommandAttachmentOption
						.setName("file")
						.setDescription("The file to get IDs from.")
						.setRequired(false)
				)
				.addBooleanOption(SlashCommandBooleanOption =>
					SlashCommandBooleanOption
						.setName("output-codeblock")
						.setDescription("Whether to post the timestamps in a codeblock.")
						.setRequired(false)
				)
				.addBooleanOption(SlashCommandBooleanOption =>
					SlashCommandBooleanOption
						.setName("output-file")
						.setDescription("Whether to post the timestamps in a file.")
						.setRequired(false)
				)
		),
	async execute(interaction: CommandInteraction) {
		if (!interaction.isChatInputCommand() || !interaction.inCachedGuild()) return
		const subcommand = interaction.options.getSubcommand()

		if (!Security.isEvalerUser(interaction.user)) {
			interaction.reply({
				content: "You do not have permission to use this command.",
				ephemeral: true
			})
			return
		}

		await interaction.deferReply()

		// eslint-disable-next-line security/detect-unsafe-regex
		const inviteRegex = new RE2(/((?:https?:\/\/)?discord(?:(?:app)?.com\/invite\/|.gg\/)[A-Za-z0-9]{2,})/gmi)
		const idRegex = new RE2(/\d{17,20}/gmi)
		const succeeded: string[] = []
		let failed: string[] = []
		const blacklistTargets: BlacklistTarget[] = []

		/* Defang */
		const urls = interaction.options.getString("urls")?.split(" ") ?? []
		const defanged: string[] = []

		/* Extract IDs */
		const string = interaction.options.getString("string")
		let ids: string[] | string = []

		/* Get Creation Dates */
		const idsOption = interaction.options.getString("ids")
		const fileOption = interaction.options.getAttachment("file")
		const codeblock = interaction.options.getBoolean("output-codeblock")
		const file = interaction.options.getBoolean("output-file")
		let timestamps: string[] | string = []
		let totalTime = 0
		let count = 0

		switch (subcommand) {
		case "blacklist-guilds":

			if (!Security.isEvalerUser(interaction.user)) {
				interaction.editReply({
					content: "You do not have permission to use this command.",
				})
				return
			}

			const targets: string = interaction.options.getString("guilds", true)

			const inviteMatches = targets.match(inviteRegex) ?? []
			const idMatches = targets.match(idRegex) ?? []
			const guilds = [...inviteMatches, ...idMatches]

			const waitTime = guilds.length > 5 ? 2000 : 1000

			if (!guilds) return interaction.editReply("No guilds were specified. Make sure you format the guilds correctly.")

			for (let guild of guilds) {
				const reasonKey = targets.split(guild)[1].trim().split(" ")[0].replace(",", "")

				if (inviteRegex.test(guild)) {
					util.parseGuildIDFromInvite(interaction.client, guild)
						.then((id) => {
							if (!id) {
								failed.push(guild)
								return
							}
							guild = id
						})
						.catch((err) => {
							failed.push(`${guild} is an invite but could not parse the guild ID. Error: ${err}`)
							return
						})
				}

				if (!Object.keys(BlacklistReasonKeys).includes(reasonKey)) {
					failed.push(`${guild} has an invalid reason key.`)
					continue
				}

				blacklistTargets.push({
					guild,
					reasonKey: (reasonKey as BlacklistReasonKey)
				})
			}

			if (failed.length > 0) {
				interaction.editReply(`Unable to blacklist. Found ${failed.length} issues:\n${failed.join("\n")}\n\nPlease fix these issues and try again.`)
				return
			}

			failed = []

			for await (const target of blacklistTargets) {
				const body = {
					id: target.guild,
					reasonKey: target.reasonKey
				}

				await axios.post("https://api.phish.gg/add-server", body, {
					headers: {
						"Authorization": process.env.PHISH_GG_API_KEY
					}
				})
					.then(async (res) => {
						if (res.status === 200) {
							if (res.data.err) {
								failed.push(`${target.guild} failed to be blacklisted. Reason: ${res.data.err}`)
							} else {
								succeeded.push(`${target.guild} was blacklisted for ${target.reasonKey}.`)
							}
						} else {
							if (res.data.err) {
								failed.push(`${target.guild} failed to be blacklisted. Reason: ${res.data.err}`)
							} else {
								failed.push(`${target.guild} failed to be blacklisted. Reason: ${res.statusText}`)
							}
						}
					})
					.catch((err) => {
						if (err.response.err) {
							failed.push(`${target.guild} failed to be blacklisted. Reason: ${err.response.err}`)
						} else {
							log.error(err)
							failed.push(`${target.guild} failed to be blacklisted. Reason: ${err}`)
						}
					})

				await new Promise((resolve) => setTimeout(resolve, waitTime))
			}

			const successFile = new AttachmentBuilder(Buffer.from(succeeded.join("\n")), {
				name: "success.txt",
			})

			const errorFile = new AttachmentBuilder(Buffer.from(failed.join("\n")), {
				name: "errors.txt",
			})

			interaction.editReply({
				content: `Successfully blacklisted ${succeeded.length} guilds. Failed to blacklist ${failed.length} guilds. Success rate: ${succeeded.length / (succeeded.length + failed.length) * 100}%`,
				files: [successFile, errorFile]
			})
			break
		case "defang":
			if (!urls) return interaction.editReply("No URLs were able to be parsed from your message.")
			for (const url of urls) {
				defanged.push(AntiPhishUtil.defangURL(url))
			}

			interaction.editReply({
				content: `Successfully defanged ${defanged.length} URLs.\n\n${defanged.join(" ")}`,
				allowedMentions: {}
			})
			break
		case "extract-ids":
			if (!string) return

			const result = string.matchAll(idRegex)

			for (const match of result) {
				ids.push(match[0])
			}

			ids = ids.join(" ")

			if (!ids) return interaction.editReply("No IDs were found.")

			if (ids.length > 2000) {
				const file = new AttachmentBuilder(Buffer.from(ids), {
					name: "ids.txt",
				})

				interaction.editReply({
					content: "The IDs were too long to be sent in a message. Here is a file containing the IDs.",
					files: [file]
				})
				return
			}

			interaction.editReply({
				content: `Successfully extracted ${ids.split(" ").length} IDs.\n\n${ids}`,
				allowedMentions: {}
			})
			break
		case "get-creation-dates":
			if (idsOption && fileOption) return interaction.editReply("You can only provide IDs through a file or a as a string, not both.")
			if (codeblock && file) return interaction.editReply("You can only request a response in a codeblock or a file format, not both.")

			if (idsOption) {
				ids = idsOption.split(" ")
			} else if (fileOption) {
				const fileString = await util.getFileDataFromCDN(fileOption.url)
				ids = fileString.split(" ")
			}

			for (const id of ids) {
				const time = util.generateTimestampFromSnowflake("R", id, false, true)
				totalTime += parseInt(time)
				count++
				timestamps.push(`${id} <t:${time}:R> | `)
			}

			timestamps = timestamps.join(" ")

			if (codeblock) {
				interaction.editReply({
					content: `Successfully retrieved ${ids.length} timestamps.\n\n\`\`\`${timestamps}\n\nAverage <t:${Math.round(totalTime / count)}:R>\`\`\``,
					allowedMentions: {}
				})
				return
			} else if (file || timestamps.length > 2000) {
				const file = new AttachmentBuilder(Buffer.from(timestamps), {
					name: "timestamps.txt",
				})

				interaction.editReply({
					content: `Successfully retrieved ${ids.length} timestamps. Average <t:${Math.round(totalTime / count)}:R>.`,
					files: [file]
				})
				return
			}

			interaction.editReply({
				content: `Successfully retrieved ${ids.length} timestamps. Average <t:${Math.round(totalTime / count)}:R>.\n\n${timestamps}`,
				allowedMentions: {}
			})
		}
	}
}