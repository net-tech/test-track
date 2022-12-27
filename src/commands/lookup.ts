import { stripIndents } from "common-tags"
import { ActionRowBuilder, AttachmentBuilder, Interaction, ButtonBuilder, ButtonStyle, codeBlock, CommandInteraction, EmbedBuilder, Invite, SlashCommandBuilder } from "discord.js"
import RE2 from "re2"
import AntiPhishService from "../services/antiphish"
import { log } from "../services/logger"
import Sentry from "../services/sentry"
import { Color, Icon, Regex } from "../types/messages"
import AntiPhishUtil from "../utilities/antiphish"
import util from "../utilities/general"
import whoiser, { WhoisSearchResult } from "whoiser"
import axios from "axios"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("lookup")
		.setDescription("Lookup information about a target like a user.")
		.addStringOption(SlashCommandStringOption =>
			SlashCommandStringOption
				.setName("target")
				.setDescription("The target to lookup. Can be a invite, guild id, user id, domain, or IP address.")
				.setRequired(true)
		),
	async execute(interaction: CommandInteraction) {
		if (!interaction.isChatInputCommand() || !interaction.inCachedGuild()) return

		const target = interaction.options.getString("target", true)

		/* Misc */

		const { client } = interaction
		const inviteRegex = new RE2(Regex.Invite)
		const domainRegex = new RE2(Regex.Domain)
		const ipRegex = new RE2(Regex.Ip)
		const idRegex = new RE2(Regex.Id)
		const messageAttachments: AttachmentBuilder[] = []
		let ipInfoEmbed = new EmbedBuilder()

		/* Invite */

		let inviteInfoEmbed = new EmbedBuilder()
		let invite: Invite | null | void = null
		let guildBlacklist: string | boolean = false
		const actionRowGuild = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setLabel("View All Features")
					.setStyle(ButtonStyle.Primary)
					.setCustomId("view-all-features")
			)

		/* Domain */
		let isPhishing = false
		let domainInfoEmbed = new EmbedBuilder()
		let whoisData

		/* ID */
		const questionRow = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setLabel("Guild ID")
					.setStyle(ButtonStyle.Primary)
					.setCustomId("guild-id"),
				new ButtonBuilder()
					.setLabel("User ID")
					.setStyle(ButtonStyle.Primary)
					.setCustomId("user-id")
			)

		await interaction.deferReply()

		switch (true) {
		case inviteRegex.test(target):

			invite = await client.fetchInvite(target)
				.catch((err) => {
					interaction.editReply({
						content: "Error while fetching invite."
					})
					log.error(err, "Error while fetching invite.")
				})

			if (!invite || !invite.guild) return

			guildBlacklist = await Sentry.isBlacklistedGuild(invite.guild.id)

			inviteInfoEmbed = new EmbedBuilder()
				.setTitle(`${invite.guild.name} (${invite.guild.id})`)
				.setThumbnail(invite.guild.iconURL({ size: 4096 }))
				.addFields([
					{
						name: "Invite",
						value: stripIndents`
							> Vanity URL: ${invite.guild.vanityURLCode ?? "N/A"}
							> URL: ${invite.url ?? "Unknown"}
							> Uses: ${invite.uses ?? "Unknown"}
							> Channel: ${invite.channel?.name ?? "Unknown"} (${invite.channel?.id ?? "Unknown"})
							`,
						inline: false
					},
					{
						name: "Guild",
						value: stripIndents`
							> Creation Date: ${util.generateTimestamp("F", invite.guild.createdAt, undefined, true)}
							> NSFW Level: ${invite.guild.nsfwLevel ?? "Unknown"}
							> Verification Level: ${invite.guild.verificationLevel ?? "Unknown"}
							`,
						inline: false
					},
					{
						name: "Members",
						value: stripIndents`
							> Total: ${invite.memberCount ?? "Unknown"}
							> Online: ${invite.presenceCount ?? "Unknown"}
							> Offline: ${invite.memberCount - invite.presenceCount ?? "Unknown"}
							> Percent Online: ${Math.round(invite.presenceCount / invite.memberCount * 100) ?? "Unknown"}%
							`,
						inline: false
					},
					{
						name: "Description",
						value: invite.guild.description ?? "Unknown",
						inline: false,
					}, {
						name: "Features",
						value: invite.guild.features.length > 5 ? invite.guild.features.slice(0, 5).join(", ") + " **...**" : invite.guild.features.join(", ") ?? "Unknown",
					}
				])
				.setFooter({
					text: "* = Approximate | Blacklist checking powered by Phish.GG",
				})

			if (invite.guild.banner) {
				inviteInfoEmbed.setImage(invite.guild.bannerURL({ size: 4096 }) ?? "")
				inviteInfoEmbed.addFields([
					{
						name: "Banner",
						value: "** **",
					}
				])
			}

			if (guildBlacklist) {
				inviteInfoEmbed.setAuthor({
					name: `${guildBlacklist}`,
					iconURL: Icon.Cross
				})
				inviteInfoEmbed.setColor(Color.Red)
			} else {
				inviteInfoEmbed.setAuthor({
					name: "Not Blacklisted",
					iconURL: Icon.Check
				})
				inviteInfoEmbed.setColor(Color.Green)
			}

			await client.fetchGuildWidget(invite.guild.id)
				.then(async (widget) => {
					const membersList = widget.members.map((member) => {
						return `${member.username}#${member.discriminator} (${member.id})`
					})

					const channelList = widget.channels.map((channel) => {
						return `Position ${channel.position} - ${channel.name} (${channel.id})`
					})

					messageAttachments.push(new AttachmentBuilder(Buffer.from(membersList.join("\n")), {
						name: "members.txt",
					}))

					messageAttachments.push(new AttachmentBuilder(Buffer.from(channelList.join("\n")), {
						name: "channels.txt",
					}))
				})
				.catch(() => {
					inviteInfoEmbed.addFields([
						{
							name: "Widget",
							value: "Unable to fetch widget. Likely due to the guild not having a widget enabled.",
						}
					])
				})

			await interaction.editReply({
				embeds: [inviteInfoEmbed],
				components: [actionRowGuild],
				files: messageAttachments ?? [],
			})

			if (!guildBlacklist) interaction.channel?.send("</bulk blacklist-guilds:1054085581086396498>")
			break
		case domainRegex.test(target):
			isPhishing = await AntiPhishService.isPhishing(target)
			whoisData = firstResult(await whoiser(target))

			if (!whoisData) {
				interaction.editReply({
					content: "Unable to find domain info.",
					components: [],
				})
				return
			}

			if(typeof whoisData === "object") {
				delete (whoisData as WhoisSearchResult).text
			}

			domainInfoEmbed = new EmbedBuilder()
				.setTitle(`Domain Info - ${AntiPhishUtil.defangURL(target)}`)
				.setAuthor({
					name: isPhishing ? "Phishing" : "Not Phishing",
					iconURL: isPhishing ? Icon.Cross : Icon.Check,
				})
				.setDescription(`\`\`\`json\n${JSON.stringify(whoisData, null, 4)}\n\`\`\``)
				.setColor(isPhishing ? Color.Red : Color.Green)

			await interaction.editReply({
				embeds: [domainInfoEmbed],
			})
			break
		case ipRegex.test(target):
			whoisData = await whoiser(target)

			if (!whoisData) {
				interaction.editReply({
					content: "Unable to find IP info.",
					components: [],
				})
				return
			}

			if (typeof whoisData === "object") {
				delete (whoisData as WhoisSearchResult).text
			}

			ipInfoEmbed = new EmbedBuilder()
				.setTitle(`IP Info - ${target}`)
				.setDescription(`\`\`\`json\n${JSON.stringify(whoisData, null, 4)}\n\`\`\``)
				.setColor(Color.Blue)

			await interaction.editReply({
				embeds: [ipInfoEmbed],
			})
			break
		case idRegex.test(target):
			interaction.editReply({
				content: "What type of ID is this?",
				components: [questionRow],
			})

			// eslint-disable-next-line no-case-declarations
			const questionCollector = interaction.channel?.createMessageComponentCollector({
				filter: (i) => i.user.id === interaction.user.id,
				time: 30000,
			})

			questionCollector?.on("collect", async (i) => {
				await i.deferUpdate()
				if (i.customId === "user-id") {
					questionCollector.stop("user-id")
					i.editReply({
						content: "",
						embeds: [await infoUser(target)],
						components: [],
					})
				} else if (i.customId === "guild-id") {
					questionCollector.stop("guild-id")
					await infoGuild(target, i)
				}
			})

			questionCollector?.on("end", async (collected, reason) => {
				if (reason === "time") {
					await interaction.editReply({
						content: "Timed out.",
						components: [],
					})
				}
			})


			break
		default:
			await interaction.editReply({
				content: "Unknown target type."
			})
			break
		}

		async function infoUser(id: string) {
			const user = await client.users.fetch(id)
			const inGuild = await interaction.guild?.members.fetch(id)
				.catch(() => false)

			const flagsStrings = user.flags?.toArray().map((flag) => flag.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())) ?? []
			if ((user.flags?.bitfield as number) & 1 << 20) flagsStrings.push("Spammer")
			const blacklistInfo = await Sentry.isBlacklistedUser(user.id)

			const infoEmbed = new EmbedBuilder()
				.setTitle(`Global User Info - ${user.tag}`)
				.setDescription(stripIndents`
					**ID:** ${user.id}
					**Username:** ${user.username}
					**Discriminator:** ${user.discriminator}
					**Bot:** ${user.bot ? "Yes" : "No"}
					**Creation Date:** ${util.generateTimestamp("F", user.createdAt, undefined, true)}
					**Discord System Component:** ${user.system ? "Yes" : "No"}
					**Flags:** ${user.flags?.bitfield} (${flagsStrings} )
					**In Guild:** ${inGuild ? "Yes" : "No"}
				`)
				.setThumbnail(user.avatarURL({ size: 4096 }) ?? user.defaultAvatarURL)
				.addFields([
					{
						name: `Background Check ${blacklistInfo.dangerous ? "" : "- OK"}`,
						value: `${Sentry.formatBlacklistResponse(blacklistInfo)}`,
					}
				])
				.setColor(blacklistInfo.dangerous ? Color.Red : Color.Green)

			if (user.bannerURL()) {
				infoEmbed.setImage(user.bannerURL({ size: 4096 }) as string)
				infoEmbed.addFields([
					{
						name: "Banner",
						value: "** **",
					}
				])
			}

			return infoEmbed
		}

		async function infoGuild(id: string, interaction: Interaction) {

			if (interaction.isAutocomplete()) {
				return Error("Unexpected autocomplete interaction")
			}

			const isBlacklisted = await Sentry.isBlacklistedGuild(id)

			const status = await axios.get(`https://discord.com/api/guilds/${id}/widget.json`)
				.then(() => {
					return 1
				})
				.catch((err) => {
					console.log(err)
					if (err.response.status === 403) return 2
					if (err.response.status === 404) return 3
					return err.response.status
				})

			return await client.fetchGuildWidget(id)
				.then(async (widget) => {
					const infoEmbed = new EmbedBuilder()
						// @ts-expect-error As of djs 14.7.1, this is not typed
						.setTitle(`Global Guild Info - ${widget.name}`)
						.setDescription(stripIndents`
							**ID:** ${widget.id}${/* @ts-expect-error As of djs 14.7.1, this is not typed */""}
							**Name:** ${widget.name}
							**Online Members:** ${widget.presenceCount}
							**Instant Invite:** ${widget.instantInvite ?? "None"}
							**Creation Date:** ${util.generateTimestampFromSnowflake("F", widget.id, true)}
							`)

					if (widget.instantInvite) {
						infoEmbed.addFields([
							{
								name: "Tip",
								value: "You can use the lookup command and pass the instant invite to get more info about the guild.",
							}
						])
					}

					if (guildBlacklist) {
						infoEmbed.setAuthor({
							name: `${guildBlacklist}`,
							iconURL: Icon.Cross
						})
						infoEmbed.setColor(Color.Red)
					} else {
						infoEmbed.setAuthor({
							name: "Not Blacklisted",
							iconURL: Icon.Check
						})
						infoEmbed.setColor(Color.Green)
					}

					const membersList = widget.members.map((member) => {
						return `${member.username}#${member.discriminator} (${member.id})`
					})

					const channelList = widget.channels.map((channel) => {
						return `Position ${channel.position} - ${channel.name} (${channel.id})`
					})

					messageAttachments.push(new AttachmentBuilder(Buffer.from(membersList.join("\n")), {
						name: "members.txt",
					}))

					messageAttachments.push(new AttachmentBuilder(Buffer.from(channelList.join("\n")), {
						name: "channels.txt",
					}))

					// Couldn't figure out how to pass the attachments to the embed so just directly editing the interaction here	

					interaction.editReply({
						embeds: [infoEmbed],
						files: messageAttachments,
						components: [],
						content: null,
					})

				})
				.catch(async (err) => {
					const infoEmbed = new EmbedBuilder()
						.setTitle(`${status === 2 ? "Guild exists - widget disabled" : "Guild does not exist"}`)
						.setDescription(stripIndents`
							Provided Snowflake Date: ${util.generateTimestampFromSnowflake("F", id, true)}
						`)
						.addFields([
							{
								name: "Error",
								value: `${codeBlock(err)}`
							}
						])

					if (isBlacklisted) {
						infoEmbed.setAuthor({
							name: `${isBlacklisted}`,
							iconURL: Icon.Cross
						})
						infoEmbed.setColor(Color.Red)
					} else {
						infoEmbed.setAuthor({
							name: "Not Blacklisted",
							iconURL: Icon.Check
						})
						infoEmbed.setColor(Color.Green)
					}

					// Couldn't figure out how to pass the attachments to the embed so just directly editing the interaction here	
					interaction.editReply({
						embeds: [infoEmbed],
						files: messageAttachments,
						components: [],
						content: null,
					})
				})
		}

		function firstResult(whoisResults: WhoisSearchResult | never) {
			const whoisServers = Object.keys(whoisResults)

			return whoisServers.length ? whoisResults[whoisServers[0]] : null
		}
	}
}