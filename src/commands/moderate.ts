import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, Collection, CommandInteraction, EmbedBuilder, GuildMember, GuildTextBasedChannel, Interaction, Message, PermissionFlagsBits, SlashCommandBuilder, User } from "discord.js"
import RE2 from "re2"
import { nanoid } from "nanoid"
import normalize from "../services/normalize"
import { stripIndents } from "common-tags"
import util from "../utilities/general"
import { Stopwatch } from "@sapphire/stopwatch"
import parse from "parse-duration"
import { Color } from "../types/messages"
import { once } from "node:events"
import { dangerousPermissions } from "../types/apis"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("moderate")
		.setDescription("Preforms a moderation action.")
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.setDMPermission(false)
		.addSubcommand(SlashCommandSubcommandBuilder => 
			SlashCommandSubcommandBuilder
				.setName("purge")
				.setDescription("Purges a specified amount of messages following certain criteria.")
				.addNumberOption(SlashCommandNumberOption =>
					SlashCommandNumberOption
						.setName("num-messages")
						.setDescription("The number of messages to fetch. 1-1000 or -1 for all messages.")
						.setRequired(true)
						.setMinValue(-1)
						.setMaxValue(1000)
				)
				.addMentionableOption(SlashCommandMentionableOption =>
					SlashCommandMentionableOption
						.setName("target")
						.setDescription("The target of the purge. Can be a user or role.")
						.setRequired(false)
				)
				.addBooleanOption(SlashCommandBooleanOption =>
					SlashCommandBooleanOption
						.setName("include-pinned")
						.setDescription("Whether to include pinned messages in the purge.")
						.setRequired(false)
				)
				.addBooleanOption(SlashCommandBooleanOption =>
					SlashCommandBooleanOption
						.setName("only-bots")
						.setDescription("Whether to purge messages only messages from bots.")
						.setRequired(false)
				)
				.addBooleanOption(SlashCommandBooleanOption =>
					SlashCommandBooleanOption
						.setName("only-embeds")
						.setDescription("Whether to purge messages only messages with embeds.")
						.setRequired(false)
				)
				.addBooleanOption(SlashCommandBooleanOption =>
					SlashCommandBooleanOption
						.setName("only-reactions")
						.setDescription("Whether to purge messages only messages with reactions.")
						.setRequired(false)
				)
				.addBooleanOption(SlashCommandBooleanOption =>
					SlashCommandBooleanOption
						.setName("only-emoji")
						.setDescription("Whether to purge messages only messages with emoji.")
						.setRequired(false)
				)
				.addBooleanOption(SlashCommandBooleanOption =>
					SlashCommandBooleanOption
						.setName("only-text")
						.setDescription("Whether to purge messages only messages with text.")
						.setRequired(false)
				)
				.addBooleanOption(SlashCommandBooleanOption =>
					SlashCommandBooleanOption
						.setName("no-avatar")
						.setDescription("Whether to purge messages only messages from users without avatars.")
						.setRequired(false)
				)
				.addNumberOption(SlashCommandNumberOption =>
					SlashCommandNumberOption
						.setName("only-account-age")
						.setDescription("Whether to purge messages only from users accounts younger than the specified number of days.")
						.setRequired(false)
				)
				.addBooleanOption(SlashCommandBooleanOption =>
					SlashCommandBooleanOption
						.setName("no-role")
						.setDescription("Whether to purge messages only messages from users without roles.")
						.setRequired(false)
				)
				.addBooleanOption(SlashCommandBooleanOption =>
					SlashCommandBooleanOption
						.setName("only-attachments")
						.setDescription("Whether to purge messages only messages with attachments.")
						.setRequired(false)
				)
				.addBooleanOption(SlashCommandBooleanOption =>
					SlashCommandBooleanOption
						.setName("only-links")
						.setDescription("Whether to purge messages only messages with links.")
						.setRequired(false)
				)
				.addStringOption(SlashCommandStringOption =>
					SlashCommandStringOption
						.setName("sent-in-the-last-x")
						.setDescription("Whether to purge messages only messages sent in the last x seconds/minutes/hours/days/weeks/years.")
						.setRequired(false)
				)
				.addStringOption(SlashCommandStringOption =>
					SlashCommandStringOption
						.setName("after")
						.setDescription("Whether to purge messages only messages after the specified message link/ID.")
						.setRequired(false)
				)
				.addStringOption(SlashCommandStringOption =>
					SlashCommandStringOption
						.setName("before")
						.setDescription("Whether to purge messages only messages before the specified message link/ID.")
						.setRequired(false)
				)
				.addStringOption(SlashCommandStringOption =>
					SlashCommandStringOption
						.setName("contains")
						.setDescription("Whether to purge messages only messages containing the specified string.")
						.setRequired(false)
				)
				.addStringOption(SlashCommandStringOption =>
					SlashCommandStringOption
						.setName("exactly-contains")
						.setDescription("Whether to purge messages only messages containing the specified string exactly.")
						.setRequired(false)
				)
				.addStringOption(SlashCommandStringOption =>
					SlashCommandStringOption
						.setName("starts-with")
						.setDescription("Whether to purge messages only messages starting with the specified string.")
						.setRequired(false)
				)
				.addStringOption(SlashCommandStringOption =>
					SlashCommandStringOption
						.setName("ends-with")
						.setDescription("Whether to purge messages only messages ending with the specified string.")
						.setRequired(false)
				)
				.addStringOption(SlashCommandStringOption =>
					SlashCommandStringOption
						.setName("regex")
						.setDescription("Whether to purge messages only messages matching the specified regex.")
						.setRequired(false)
				)
				.addStringOption(SlashCommandStringOption =>
					SlashCommandStringOption
						.setName("reason")
						.setDescription("The reason for the purge.")
						.setRequired(false)
				)
		)
		.addSubcommand(SlashCommandSubcommand =>
			SlashCommandSubcommand
				.setName("clean-name")
				.setDescription("Dehoists user(s) and removes any unmentionable characters from their name.")
				.addUserOption(SlashCommandUserOption =>
					SlashCommandUserOption
						.setName("target")
						.setDescription("The user to clean the name of.")
						.setRequired(false)
				)
				.addBooleanOption(SlashCommandBooleanOption =>
					SlashCommandBooleanOption
						.setName("all")
						.setDescription("Whether to clean the name of all users.")
						.setRequired(false)
				)
				.addStringOption(SlashCommandStringOption =>
					SlashCommandStringOption
						.setName("reason")
						.setDescription("The reason for the name clean(s).")
						.setRequired(false)
				)
		)
		.addSubcommand(SlashCommandSubcommand =>
			SlashCommandSubcommand
				.setName("show-permissions")
				.setDescription("Shows the permissions of a user.")
				.addUserOption(SlashCommandUserOption =>
					SlashCommandUserOption
						.setName("target")
						.setDescription("The user to show the permissions of.")
						.setRequired(true)
				)
		),
	async execute(interaction: CommandInteraction) {
		if (!interaction.isChatInputCommand() || !interaction.inCachedGuild() || !interaction.guild || !interaction.channel) return
		
		const subcommand = interaction.options.getSubcommand()

		/* Purge */
		let numMessages = interaction.options.getNumber("num-messages")
		if (numMessages === -1) numMessages = 100
		const targetPurge = interaction.options.getUser("target")
		const onlyBots = interaction.options.getBoolean("only-bots")
		const onlyHumans = interaction.options.getBoolean("only-humans")
		const onlyEmbeds = interaction.options.getBoolean("only-embeds")
		const onlyReactions = interaction.options.getBoolean("only-reactions")
		const onlyEmoji = interaction.options.getBoolean("only-emoji")
		const onlyText = interaction.options.getBoolean("only-text")
		const noAvatar = interaction.options.getBoolean("no-avatar")
		const onlyAccountAge = interaction.options.getNumber("only-account-age")
		const noRole = interaction.options.getBoolean("no-role")
		const onlyAttachments = interaction.options.getBoolean("only-attachments")
		const onlyLinks = interaction.options.getBoolean("only-links")
		let sentInTheLast: string | number | null = interaction.options.getString("sent-in-the-last")
		sentInTheLast = sentInTheLast ? parse(sentInTheLast) : null
		const after = interaction.options.getString("after")
		const before = interaction.options.getString("before")
		const contains = interaction.options.getString("contains")
		const exactlyContains = interaction.options.getString("exactly-contains")
		const startsWith = interaction.options.getString("starts-with")
		const endsWith = interaction.options.getString("ends-with")
		const regex = interaction.options.getString("regex")
		const reasonPurge = interaction.options.getString("reason")
		let RE2Regex: RE2 | null = null

		/* Clean Name */
		let targetClean: User | GuildMember | null = interaction.options.getUser("target")
		const all = interaction.options.getBoolean("all")
		const reasonClean = interaction.options.getString("reason")
		const reasonCleanAudit = reasonClean ? `${interaction.user.tag} (${interaction.user.id}): ${reasonClean}` : `${interaction.user.tag} (${interaction.user.id}): [No reason specified]`
		let members = null
		const promises = []
		let changed = 0
		const failedChanges: unknown[] = []
		let skippedPerms = 0
		let strErr = ""

		/* Show Permissions */
		let targetShow: User | GuildMember | null = interaction.options.getUser("target")
		let permissions: string[] = []

		switch (subcommand) {
		case "purge":

			if (regex) {
				RE2Regex = new RE2(regex)
			}
		
			if (!numMessages) {
				await interaction.reply({ content: "You must specify the number of messages to purge.", ephemeral: true })
				return
			}

			if (numMessages > 1000) {
				await interaction.reply({ content: "You can only purge 1000 messages at a time.", ephemeral: true })
				return
			}

			if (onlyBots && onlyHumans) {
				await interaction.reply({ content: "You can only specify either only-bots or only-humans.", ephemeral: true })
				return
			}

			if (onlyAttachments && onlyText) {
				await interaction.reply({ content: "You can only specify either only-attachments or only-text.", ephemeral: true })
				return
			}

			if (exactlyContains && (contains || startsWith || endsWith || regex)) {
				await interaction.reply({ content: "You can only specify exactly-contains or any of the other string filters.", ephemeral: true })
				return
			}

			if (numMessages < 2) {
				await interaction.reply({ content: "You must purge at least one message.", ephemeral: true })
				return
			}

			// eslint-disable-next-line no-case-declarations
			let messages: Collection<string, Message<true>>

			// If there are over 100 messages, we need to fetch them in batches
			if (numMessages > 100) {
				messages = await interaction.channel.messages.fetch({ limit: 100 })
				let numFetched = 100
				while (numFetched < numMessages) {
					const lastMessage = messages.last()
					const fetched = await interaction.channel.messages.fetch({ limit: 100, before: lastMessage?.id })
					messages.concat(fetched)
					numFetched += fetched.size
				}
			} else {
				messages = await interaction.channel.messages.fetch({ limit: numMessages })
			}

			// Filter messages
			messages = messages.filter(message => {
				if (targetPurge && message.author.id !== targetPurge.id) return false
				if (onlyBots && !message.author.bot) return false
				if (onlyHumans && message.author.bot) return false
				if (onlyEmbeds && !message.embeds.length) return false
				if (onlyReactions && !message.reactions.cache.size) return false
				if (onlyEmoji && !message.reactions.cache.some(reaction => reaction.emoji.id === null)) return false
				if (onlyText && !message.content) return false
				if (noAvatar && message.author.avatarURL()) return false
				if (onlyAccountAge && (Date.now() - message.author.createdTimestamp) / 1000 / 60 / 60 / 24 < onlyAccountAge) return false
				if (noRole && message.member?.roles.cache.size) return false
				if (onlyAttachments && !message.attachments.size) return false
				if (onlyLinks && !message.content.match(/https?:\/\/\S+/)) return false
				if (sentInTheLast && message.createdTimestamp < (Date.now() - (sentInTheLast as number))) return false
				if (contains && !message.content.includes(contains)) return false
				if (exactlyContains && message.content !== exactlyContains) return false
				if (startsWith && !message.content.startsWith(startsWith)) return false
				if (endsWith && !message.content.endsWith(endsWith)) return false
				if (regex && RE2Regex && !RE2Regex.test(message.content)) return false
				if (message.createdTimestamp < (Date.now() - 1209600000)) return false
				return true
			})

			if (before && after) {//do in between
				const beforeMessage = await interaction.channel?.messages.fetch(before)
				const afterMessage = await interaction.channel?.messages.fetch(after)
				if (!beforeMessage || !afterMessage) return false
				messages = messages.filter(message => message.createdTimestamp < beforeMessage.createdTimestamp && message.createdTimestamp > afterMessage.createdTimestamp)
			} else if (before) {
				const beforeMessage = await interaction.channel?.messages.fetch(before)
				if (!beforeMessage) return false
				messages = messages.filter(message => message.createdTimestamp < beforeMessage.createdTimestamp)
				return false
			} else if (after) {
				const afterMessage = await interaction.channel?.messages.fetch(after)
				if (!afterMessage) return false
				messages = messages.filter(message => message.createdTimestamp > afterMessage.createdTimestamp)
			}

			if (!messages.size) {
				await interaction.reply({ content: "No messages matched the specified filters.", ephemeral: true })
				return
			}

			if (messages.size > 100) {
				const confirmEmbed = new EmbedBuilder()
					.setTitle("Confirmation Required")
					.setDescription(`With the specified filters, **${messages.size} messages will be purged.** Are you sure you want to continue? This action cannot be undone.`)
					.setColor(Color.Orange)

				const confirmRow = new ActionRowBuilder<ButtonBuilder>()
					.addComponents(
						new ButtonBuilder()
							.setCustomId("purge_confirm")
							.setLabel("Confirm")
							.setStyle(ButtonStyle.Danger),
						new ButtonBuilder()
							.setCustomId("purge_cancel")
							.setLabel("Cancel")
							.setStyle(ButtonStyle.Secondary)
					)

				await interaction.reply({ embeds: [confirmEmbed], components: [confirmRow] })

				const filter = (i: Interaction) => i.user.id === interaction.user.id
				const collector = interaction.channel.createMessageComponentCollector({ filter, time: 10000, max: 1 })

				collector.once("end", async (collected, reason) => {
					if(reason === "time") {
						await interaction.editReply({ content: "Timed out.", embeds: [], components: [] })
						return
					}
				})

				collector.once("collect", async (i) => {
					if (i.customId === "purge_confirm") {
						await i.update({ content: "Purging...", embeds: [], components: [] })
						await purgeMessages(messages, interaction.channel as GuildTextBasedChannel)
						interaction.editReply({ content: `**Purge ${nanoid(5)}:** ${messages.size} messages deleted${reasonPurge ? ` for ${reasonPurge}` : ""}.`, embeds: [], components: [] })

					} else if (i.customId === "purge_cancel") {
						await i.update({ content: "Cancelled.", embeds: [], components: [] })
					}
				})

				await once(collector, "end")
				await once(collector, "collect")
			}

			await purgeMessages(messages, interaction.channel as GuildTextBasedChannel)
			interaction.reply({ content: `**Purge ${nanoid(5)}:** ${messages.size} messages deleted${reasonPurge ? ` for ${reasonPurge}` : ""}.`, embeds: [], components: [] })

			break


		case "clean-name":
			
			if (targetClean && all) {
				await interaction.reply({ content: "You cannot specify a target when using the all option.", ephemeral: true })
				return
			}

			if (targetClean && !interaction.guild?.members.resolve(targetClean)) {
				await interaction.reply({ content: "The specified member is not in this server.", ephemeral: true })
				return
			} else if (targetClean) {
				targetClean = interaction.guild?.members.resolve(targetClean)
			}

			if (targetClean && !targetClean.manageable) {
				await interaction.reply({ content: "I do not have permission to change the nickname of that member.", ephemeral: true })
				return
			}

			if (targetClean && targetClean.id === interaction.user.id) {
				await interaction.reply({ content: "You cannot clean your own name.", ephemeral: true })
				return
			}

			if (targetClean && targetClean.user.bot) {
				await interaction.reply({ content: "You cannot clean the name of a bot.", ephemeral: true })
				return
			}

			if (targetClean && targetClean.roles.highest.position >= interaction.member?.roles.highest.position) {
				await interaction.reply({ content: "You cannot clean the name of a member with a higher or equal role.", ephemeral: true })
				return
			}

			if (targetClean && targetClean.id === interaction.guild?.ownerId) {
				await interaction.reply({ content: "You cannot clean the name of the server owner.", ephemeral: true })
				return
			}

			if (all && !interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.ManageNicknames)) {
				await interaction.reply({ content: "I do not have permission to change the nicknames of members.", ephemeral: true })
				return
			}

			if (targetClean) {
				const cleanName = await normalize.normalize(targetClean.displayName)

				if (cleanName === targetClean.displayName) {
					await interaction.reply({ content: "That member's name is already clean.", ephemeral: true })
					return
				}

				await targetClean.setNickname(cleanName, reasonCleanAudit)

				await interaction.reply({ content: `**Clean Name ${nanoid(5)}:** Cleaned ${targetClean}'s name${reasonClean ? ` for ${reasonClean}` : ""}.`, ephemeral: true })


			} else if (all) {
				members = await interaction.guild?.members.fetch()
				let text = stripIndents(`Cleaning usernames. This message will auto-update and you will be pinged when the process is over.
				
				• ${util.generateTimestamp("T", new Date())} Scanning`)

				await interaction.reply({
					content: text,
				})

				// eslint-disable-next-line no-case-declarations
				const stopwatch = new Stopwatch()
				for (const member of members.values()) {
					if (member.user.bot) continue
					if (!member.manageable) skippedPerms++
					let fixedName = await normalize.normalize(member.displayName)
					if (fixedName === member.displayName) continue
					if (fixedName.length == 1 || fixedName.length == 0) fixedName = await normalize.randNameStr("Moderated Username ")
					promises.push(member.setNickname(fixedName, `Username clean issued by ${interaction.user.tag}`))
				}
				await Promise.allSettled(promises)
					.then(results => {
						text = text + "\n" + stripIndents(`
							• ${util.generateTimestamp("T", new Date())} Waiting for Discord to apply changes
						`)
						interaction.editReply({
							content: text,
						})
						for (const result of results) {
							if (result.status === "rejected") {
								failedChanges.push(`${result.reason.user.tag} (${result.reason.user.id}) => ${result.reason.message}`)
							}
							changed++
						}
					})
					.catch((error) => {
						failedChanges.push(error)
					})
				stopwatch.stop()

				if (changed == 0) {
					text = text + "\n" + stripIndents(`\n
						• ${util.generateTimestamp("T", new Date())} No changes were made because all usernames were already clean. Skipped checking ${skippedPerms} members due to missing permissions.
					`)
					interaction.editReply({
						content: `${interaction.member.toString()} \n${text}`,
					})
					return
				}

				if (failedChanges.length > 0) {
					text = text + "\n" + stripIndents(`\n
						• ${util.generateTimestamp("T", new Date())} Failed to change ${failedChanges.length} usernames but successfully changed ${changed} usernames. Errors can be seen in the attached file.
					`)

					for (const failed of failedChanges) {
						strErr += `${failed}\n`
					}
					const errFile = new AttachmentBuilder(Buffer.from(strErr), {
						name: "errors.txt",
					})

					interaction.editReply({
						content: `${interaction.member.toString()} \n${text}`,
						files: [errFile],
					})
					return
				}

				// eslint-disable-next-line no-case-declarations
				const changedPlural = changed == 1 ? "username" : "usernames"

				text = text + "\n" + stripIndents(`\n
					• ${util.generateTimestamp("T", new Date())} Successfully changed ${changed} ${changedPlural} in ${stopwatch.toString()}
				`)

				interaction.editReply({
					content: `${interaction.member.toString()} \n${text}`,
				})
			}

			break
		case "show-permissions":

			if (!interaction.guild) return

			if (!targetShow) {
				await interaction.reply({ content: "You must provide a member to show permissions for.", ephemeral: true })
				return
			}
			
			targetShow = await interaction.guild.members.fetch(targetShow)
			
			if (!targetShow) {
				await interaction.reply({ content: "You must provide a valid member to show permissions for.", ephemeral: true })
				return
			}

			permissions = targetShow.permissions.toArray()
			permissions = permissions.map(permission => {
				permission = permission.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())
				if (dangerousPermissions.includes(permission.replace(" ", ""))) permission = `**${permission}**`
				return permission
			})

			await interaction.reply({
				content: stripIndents(`
					${targetShow.toString()} has the following permissions:
					${permissions.join(", ")}
				`),
				allowedMentions: {},
			})

			break
		}

		async function purgeMessages(messages: Collection<string, Message>, channel: GuildTextBasedChannel) {
			if (messages.size > 100) {
				let numDeleted = 0
				while (numDeleted < messages.size) {
					const batch = messages.map(message => message.id).slice(numDeleted, numDeleted + 100)
					await channel?.bulkDelete(batch, true)
					numDeleted += batch.length
				}
			} else {
				await channel.bulkDelete(messages, true)
			}
		}
		
	}
}