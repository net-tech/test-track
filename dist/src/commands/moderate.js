"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const re2_1 = __importDefault(require("re2"));
const nanoid_1 = require("nanoid");
const normalize_1 = __importDefault(require("../services/normalize"));
const common_tags_1 = require("common-tags");
const general_1 = __importDefault(require("../utilities/general"));
const stopwatch_1 = require("@sapphire/stopwatch");
const parse_duration_1 = __importDefault(require("parse-duration"));
const messages_1 = require("../types/messages");
const node_events_1 = require("node:events");
const apis_1 = require("../types/apis");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("moderate")
        .setDescription("Preforms a moderation action.")
        .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.ManageMessages)
        .setDMPermission(false)
        .addSubcommand(SlashCommandSubcommandBuilder => SlashCommandSubcommandBuilder
        .setName("purge")
        .setDescription("Purges a specified amount of messages following certain criteria.")
        .addNumberOption(SlashCommandNumberOption => SlashCommandNumberOption
        .setName("num-messages")
        .setDescription("The number of messages to fetch. 1-1000 or -1 for all messages.")
        .setRequired(true)
        .setMinValue(-1)
        .setMaxValue(1000))
        .addMentionableOption(SlashCommandMentionableOption => SlashCommandMentionableOption
        .setName("target")
        .setDescription("The target of the purge. Can be a user or role.")
        .setRequired(false))
        .addBooleanOption(SlashCommandBooleanOption => SlashCommandBooleanOption
        .setName("include-pinned")
        .setDescription("Whether to include pinned messages in the purge.")
        .setRequired(false))
        .addBooleanOption(SlashCommandBooleanOption => SlashCommandBooleanOption
        .setName("only-bots")
        .setDescription("Whether to purge messages only messages from bots.")
        .setRequired(false))
        .addBooleanOption(SlashCommandBooleanOption => SlashCommandBooleanOption
        .setName("only-embeds")
        .setDescription("Whether to purge messages only messages with embeds.")
        .setRequired(false))
        .addBooleanOption(SlashCommandBooleanOption => SlashCommandBooleanOption
        .setName("only-reactions")
        .setDescription("Whether to purge messages only messages with reactions.")
        .setRequired(false))
        .addBooleanOption(SlashCommandBooleanOption => SlashCommandBooleanOption
        .setName("only-emoji")
        .setDescription("Whether to purge messages only messages with emoji.")
        .setRequired(false))
        .addBooleanOption(SlashCommandBooleanOption => SlashCommandBooleanOption
        .setName("only-text")
        .setDescription("Whether to purge messages only messages with text.")
        .setRequired(false))
        .addBooleanOption(SlashCommandBooleanOption => SlashCommandBooleanOption
        .setName("no-avatar")
        .setDescription("Whether to purge messages only messages from users without avatars.")
        .setRequired(false))
        .addNumberOption(SlashCommandNumberOption => SlashCommandNumberOption
        .setName("only-account-age")
        .setDescription("Whether to purge messages only from users accounts younger than the specified number of days.")
        .setRequired(false))
        .addBooleanOption(SlashCommandBooleanOption => SlashCommandBooleanOption
        .setName("no-role")
        .setDescription("Whether to purge messages only messages from users without roles.")
        .setRequired(false))
        .addBooleanOption(SlashCommandBooleanOption => SlashCommandBooleanOption
        .setName("only-attachments")
        .setDescription("Whether to purge messages only messages with attachments.")
        .setRequired(false))
        .addBooleanOption(SlashCommandBooleanOption => SlashCommandBooleanOption
        .setName("only-links")
        .setDescription("Whether to purge messages only messages with links.")
        .setRequired(false))
        .addStringOption(SlashCommandStringOption => SlashCommandStringOption
        .setName("sent-in-the-last-x")
        .setDescription("Whether to purge messages only messages sent in the last x seconds/minutes/hours/days/weeks/years.")
        .setRequired(false))
        .addStringOption(SlashCommandStringOption => SlashCommandStringOption
        .setName("after")
        .setDescription("Whether to purge messages only messages after the specified message link/ID.")
        .setRequired(false))
        .addStringOption(SlashCommandStringOption => SlashCommandStringOption
        .setName("before")
        .setDescription("Whether to purge messages only messages before the specified message link/ID.")
        .setRequired(false))
        .addStringOption(SlashCommandStringOption => SlashCommandStringOption
        .setName("contains")
        .setDescription("Whether to purge messages only messages containing the specified string.")
        .setRequired(false))
        .addStringOption(SlashCommandStringOption => SlashCommandStringOption
        .setName("exactly-contains")
        .setDescription("Whether to purge messages only messages containing the specified string exactly.")
        .setRequired(false))
        .addStringOption(SlashCommandStringOption => SlashCommandStringOption
        .setName("starts-with")
        .setDescription("Whether to purge messages only messages starting with the specified string.")
        .setRequired(false))
        .addStringOption(SlashCommandStringOption => SlashCommandStringOption
        .setName("ends-with")
        .setDescription("Whether to purge messages only messages ending with the specified string.")
        .setRequired(false))
        .addStringOption(SlashCommandStringOption => SlashCommandStringOption
        .setName("regex")
        .setDescription("Whether to purge messages only messages matching the specified regex.")
        .setRequired(false))
        .addStringOption(SlashCommandStringOption => SlashCommandStringOption
        .setName("reason")
        .setDescription("The reason for the purge.")
        .setRequired(false)))
        .addSubcommand(SlashCommandSubcommand => SlashCommandSubcommand
        .setName("clean-name")
        .setDescription("Dehoists user(s) and removes any unmentionable characters from their name.")
        .addUserOption(SlashCommandUserOption => SlashCommandUserOption
        .setName("target")
        .setDescription("The user to clean the name of.")
        .setRequired(false))
        .addBooleanOption(SlashCommandBooleanOption => SlashCommandBooleanOption
        .setName("all")
        .setDescription("Whether to clean the name of all users.")
        .setRequired(false))
        .addStringOption(SlashCommandStringOption => SlashCommandStringOption
        .setName("reason")
        .setDescription("The reason for the name clean(s).")
        .setRequired(false)))
        .addSubcommand(SlashCommandSubcommand => SlashCommandSubcommand
        .setName("show-permissions")
        .setDescription("Shows the permissions of a user.")
        .addUserOption(SlashCommandUserOption => SlashCommandUserOption
        .setName("target")
        .setDescription("The user to show the permissions of.")
        .setRequired(true))),
    async execute(interaction) {
        if (!interaction.isChatInputCommand() || !interaction.inCachedGuild() || !interaction.guild || !interaction.channel)
            return;
        const subcommand = interaction.options.getSubcommand();
        /* Purge */
        let numMessages = interaction.options.getNumber("num-messages");
        if (numMessages === -1)
            numMessages = 100;
        const targetPurge = interaction.options.getUser("target");
        const onlyBots = interaction.options.getBoolean("only-bots");
        const onlyHumans = interaction.options.getBoolean("only-humans");
        const onlyEmbeds = interaction.options.getBoolean("only-embeds");
        const onlyReactions = interaction.options.getBoolean("only-reactions");
        const onlyEmoji = interaction.options.getBoolean("only-emoji");
        const onlyText = interaction.options.getBoolean("only-text");
        const noAvatar = interaction.options.getBoolean("no-avatar");
        const onlyAccountAge = interaction.options.getNumber("only-account-age");
        const noRole = interaction.options.getBoolean("no-role");
        const onlyAttachments = interaction.options.getBoolean("only-attachments");
        const onlyLinks = interaction.options.getBoolean("only-links");
        let sentInTheLast = interaction.options.getString("sent-in-the-last");
        sentInTheLast = sentInTheLast ? (0, parse_duration_1.default)(sentInTheLast) : null;
        const after = interaction.options.getString("after");
        const before = interaction.options.getString("before");
        const contains = interaction.options.getString("contains");
        const exactlyContains = interaction.options.getString("exactly-contains");
        const startsWith = interaction.options.getString("starts-with");
        const endsWith = interaction.options.getString("ends-with");
        const regex = interaction.options.getString("regex");
        const reasonPurge = interaction.options.getString("reason");
        let RE2Regex = null;
        /* Clean Name */
        let targetClean = interaction.options.getUser("target");
        const all = interaction.options.getBoolean("all");
        const reasonClean = interaction.options.getString("reason");
        const reasonCleanAudit = reasonClean ? `${interaction.user.tag} (${interaction.user.id}): ${reasonClean}` : `${interaction.user.tag} (${interaction.user.id}): [No reason specified]`;
        let members = null;
        const promises = [];
        let changed = 0;
        const failedChanges = [];
        let skippedPerms = 0;
        let strErr = "";
        /* Show Permissions */
        let targetShow = interaction.options.getUser("target");
        let permissions = [];
        switch (subcommand) {
            case "purge":
                if (regex) {
                    RE2Regex = new re2_1.default(regex);
                }
                if (!numMessages) {
                    await interaction.reply({ content: "You must specify the number of messages to purge.", ephemeral: true });
                    return;
                }
                if (numMessages > 1000) {
                    await interaction.reply({ content: "You can only purge 1000 messages at a time.", ephemeral: true });
                    return;
                }
                if (onlyBots && onlyHumans) {
                    await interaction.reply({ content: "You can only specify either only-bots or only-humans.", ephemeral: true });
                    return;
                }
                if (onlyAttachments && onlyText) {
                    await interaction.reply({ content: "You can only specify either only-attachments or only-text.", ephemeral: true });
                    return;
                }
                if (exactlyContains && (contains || startsWith || endsWith || regex)) {
                    await interaction.reply({ content: "You can only specify exactly-contains or any of the other string filters.", ephemeral: true });
                    return;
                }
                if (numMessages < 2) {
                    await interaction.reply({ content: "You must purge at least one message.", ephemeral: true });
                    return;
                }
                // eslint-disable-next-line no-case-declarations
                let messages;
                // If there are over 100 messages, we need to fetch them in batches
                if (numMessages > 100) {
                    messages = await interaction.channel.messages.fetch({ limit: 100 });
                    let numFetched = 100;
                    while (numFetched < numMessages) {
                        const lastMessage = messages.last();
                        const fetched = await interaction.channel.messages.fetch({ limit: 100, before: lastMessage?.id });
                        messages.concat(fetched);
                        numFetched += fetched.size;
                    }
                }
                else {
                    messages = await interaction.channel.messages.fetch({ limit: numMessages });
                }
                // Filter messages
                messages = messages.filter(message => {
                    if (targetPurge && message.author.id !== targetPurge.id)
                        return false;
                    if (onlyBots && !message.author.bot)
                        return false;
                    if (onlyHumans && message.author.bot)
                        return false;
                    if (onlyEmbeds && !message.embeds.length)
                        return false;
                    if (onlyReactions && !message.reactions.cache.size)
                        return false;
                    if (onlyEmoji && !message.reactions.cache.some(reaction => reaction.emoji.id === null))
                        return false;
                    if (onlyText && !message.content)
                        return false;
                    if (noAvatar && message.author.avatarURL())
                        return false;
                    if (onlyAccountAge && (Date.now() - message.author.createdTimestamp) / 1000 / 60 / 60 / 24 < onlyAccountAge)
                        return false;
                    if (noRole && message.member?.roles.cache.size)
                        return false;
                    if (onlyAttachments && !message.attachments.size)
                        return false;
                    if (onlyLinks && !message.content.match(/https?:\/\/\S+/))
                        return false;
                    if (sentInTheLast && message.createdTimestamp < (Date.now() - sentInTheLast))
                        return false;
                    if (contains && !message.content.includes(contains))
                        return false;
                    if (exactlyContains && message.content !== exactlyContains)
                        return false;
                    if (startsWith && !message.content.startsWith(startsWith))
                        return false;
                    if (endsWith && !message.content.endsWith(endsWith))
                        return false;
                    if (regex && RE2Regex && !RE2Regex.test(message.content))
                        return false;
                    if (message.createdTimestamp < (Date.now() - 1209600000))
                        return false;
                    return true;
                });
                if (before && after) { //do in between
                    const beforeMessage = await interaction.channel?.messages.fetch(before);
                    const afterMessage = await interaction.channel?.messages.fetch(after);
                    if (!beforeMessage || !afterMessage)
                        return false;
                    messages = messages.filter(message => message.createdTimestamp < beforeMessage.createdTimestamp && message.createdTimestamp > afterMessage.createdTimestamp);
                }
                else if (before) {
                    const beforeMessage = await interaction.channel?.messages.fetch(before);
                    if (!beforeMessage)
                        return false;
                    messages = messages.filter(message => message.createdTimestamp < beforeMessage.createdTimestamp);
                    return false;
                }
                else if (after) {
                    const afterMessage = await interaction.channel?.messages.fetch(after);
                    if (!afterMessage)
                        return false;
                    messages = messages.filter(message => message.createdTimestamp > afterMessage.createdTimestamp);
                }
                if (!messages.size) {
                    await interaction.reply({ content: "No messages matched the specified filters.", ephemeral: true });
                    return;
                }
                if (messages.size > 100) {
                    const confirmEmbed = new discord_js_1.EmbedBuilder()
                        .setTitle("Confirmation Required")
                        .setDescription(`With the specified filters, **${messages.size} messages will be purged.** Are you sure you want to continue? This action cannot be undone.`)
                        .setColor(messages_1.Color.Orange);
                    const confirmRow = new discord_js_1.ActionRowBuilder()
                        .addComponents(new discord_js_1.ButtonBuilder()
                        .setCustomId("purge_confirm")
                        .setLabel("Confirm")
                        .setStyle(discord_js_1.ButtonStyle.Danger), new discord_js_1.ButtonBuilder()
                        .setCustomId("purge_cancel")
                        .setLabel("Cancel")
                        .setStyle(discord_js_1.ButtonStyle.Secondary));
                    await interaction.reply({ embeds: [confirmEmbed], components: [confirmRow] });
                    const filter = (i) => i.user.id === interaction.user.id;
                    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 10000, max: 1 });
                    collector.once("end", async (collected, reason) => {
                        if (reason === "time") {
                            await interaction.editReply({ content: "Timed out.", embeds: [], components: [] });
                            return;
                        }
                    });
                    collector.once("collect", async (i) => {
                        if (i.customId === "purge_confirm") {
                            await i.update({ content: "Purging...", embeds: [], components: [] });
                            await purgeMessages(messages, interaction.channel);
                            interaction.editReply({ content: `**Purge ${(0, nanoid_1.nanoid)(5)}:** ${messages.size} messages deleted${reasonPurge ? ` for ${reasonPurge}` : ""}.`, embeds: [], components: [] });
                        }
                        else if (i.customId === "purge_cancel") {
                            await i.update({ content: "Cancelled.", embeds: [], components: [] });
                        }
                    });
                    await (0, node_events_1.once)(collector, "end");
                    await (0, node_events_1.once)(collector, "collect");
                }
                await purgeMessages(messages, interaction.channel);
                interaction.reply({ content: `**Purge ${(0, nanoid_1.nanoid)(5)}:** ${messages.size} messages deleted${reasonPurge ? ` for ${reasonPurge}` : ""}.`, embeds: [], components: [] });
                break;
            case "clean-name":
                if (targetClean && all) {
                    await interaction.reply({ content: "You cannot specify a target when using the all option.", ephemeral: true });
                    return;
                }
                if (targetClean && !interaction.guild?.members.resolve(targetClean)) {
                    await interaction.reply({ content: "The specified member is not in this server.", ephemeral: true });
                    return;
                }
                else if (targetClean) {
                    targetClean = interaction.guild?.members.resolve(targetClean);
                }
                if (targetClean && !targetClean.manageable) {
                    await interaction.reply({ content: "I do not have permission to change the nickname of that member.", ephemeral: true });
                    return;
                }
                if (targetClean && targetClean.id === interaction.user.id) {
                    await interaction.reply({ content: "You cannot clean your own name.", ephemeral: true });
                    return;
                }
                if (targetClean && targetClean.user.bot) {
                    await interaction.reply({ content: "You cannot clean the name of a bot.", ephemeral: true });
                    return;
                }
                if (targetClean && targetClean.roles.highest.position >= interaction.member?.roles.highest.position) {
                    await interaction.reply({ content: "You cannot clean the name of a member with a higher or equal role.", ephemeral: true });
                    return;
                }
                if (targetClean && targetClean.id === interaction.guild?.ownerId) {
                    await interaction.reply({ content: "You cannot clean the name of the server owner.", ephemeral: true });
                    return;
                }
                if (all && !interaction.guild?.members.me?.permissions.has(discord_js_1.PermissionFlagsBits.ManageNicknames)) {
                    await interaction.reply({ content: "I do not have permission to change the nicknames of members.", ephemeral: true });
                    return;
                }
                if (targetClean) {
                    const cleanName = await normalize_1.default.normalize(targetClean.displayName);
                    if (cleanName === targetClean.displayName) {
                        await interaction.reply({ content: "That member's name is already clean.", ephemeral: true });
                        return;
                    }
                    await targetClean.setNickname(cleanName, reasonCleanAudit);
                    await interaction.reply({ content: `**Clean Name ${(0, nanoid_1.nanoid)(5)}:** Cleaned ${targetClean}'s name${reasonClean ? ` for ${reasonClean}` : ""}.`, ephemeral: true });
                }
                else if (all) {
                    members = await interaction.guild?.members.fetch();
                    let text = (0, common_tags_1.stripIndents)(`Cleaning usernames. This message will auto-update and you will be pinged when the process is over.
				
				• ${general_1.default.generateTimestamp("T", new Date())} Scanning`);
                    await interaction.reply({
                        content: text,
                    });
                    // eslint-disable-next-line no-case-declarations
                    const stopwatch = new stopwatch_1.Stopwatch();
                    for (const member of members.values()) {
                        if (member.user.bot)
                            continue;
                        if (!member.manageable)
                            skippedPerms++;
                        let fixedName = await normalize_1.default.normalize(member.displayName);
                        if (fixedName === member.displayName)
                            continue;
                        if (fixedName.length == 1 || fixedName.length == 0)
                            fixedName = await normalize_1.default.randNameStr("Moderated Username ");
                        promises.push(member.setNickname(fixedName, `Username clean issued by ${interaction.user.tag}`));
                    }
                    await Promise.allSettled(promises)
                        .then(results => {
                        text = text + "\n" + (0, common_tags_1.stripIndents)(`
							• ${general_1.default.generateTimestamp("T", new Date())} Waiting for Discord to apply changes
						`);
                        interaction.editReply({
                            content: text,
                        });
                        for (const result of results) {
                            if (result.status === "rejected") {
                                failedChanges.push(`${result.reason.user.tag} (${result.reason.user.id}) => ${result.reason.message}`);
                            }
                            changed++;
                        }
                    })
                        .catch((error) => {
                        failedChanges.push(error);
                    });
                    stopwatch.stop();
                    if (changed == 0) {
                        text = text + "\n" + (0, common_tags_1.stripIndents)(`\n
						• ${general_1.default.generateTimestamp("T", new Date())} No changes were made because all usernames were already clean. Skipped checking ${skippedPerms} members due to missing permissions.
					`);
                        interaction.editReply({
                            content: `${interaction.member.toString()} \n${text}`,
                        });
                        return;
                    }
                    if (failedChanges.length > 0) {
                        text = text + "\n" + (0, common_tags_1.stripIndents)(`\n
						• ${general_1.default.generateTimestamp("T", new Date())} Failed to change ${failedChanges.length} usernames but successfully changed ${changed} usernames. Errors can be seen in the attached file.
					`);
                        for (const failed of failedChanges) {
                            strErr += `${failed}\n`;
                        }
                        const errFile = new discord_js_1.AttachmentBuilder(Buffer.from(strErr), {
                            name: "errors.txt",
                        });
                        interaction.editReply({
                            content: `${interaction.member.toString()} \n${text}`,
                            files: [errFile],
                        });
                        return;
                    }
                    // eslint-disable-next-line no-case-declarations
                    const changedPlural = changed == 1 ? "username" : "usernames";
                    text = text + "\n" + (0, common_tags_1.stripIndents)(`\n
					• ${general_1.default.generateTimestamp("T", new Date())} Successfully changed ${changed} ${changedPlural} in ${stopwatch.toString()}
				`);
                    interaction.editReply({
                        content: `${interaction.member.toString()} \n${text}`,
                    });
                }
                break;
            case "show-permissions":
                if (!interaction.guild)
                    return;
                if (!targetShow) {
                    await interaction.reply({ content: "You must provide a member to show permissions for.", ephemeral: true });
                    return;
                }
                targetShow = await interaction.guild.members.fetch(targetShow);
                if (!targetShow) {
                    await interaction.reply({ content: "You must provide a valid member to show permissions for.", ephemeral: true });
                    return;
                }
                permissions = targetShow.permissions.toArray();
                permissions = permissions.map(permission => {
                    permission = permission.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase());
                    if (apis_1.dangerousPermissions.includes(permission))
                        permission = `**${permission}**`;
                    return permission;
                });
                await interaction.reply({
                    content: (0, common_tags_1.stripIndents)(`
					${targetShow.toString()} has the following permissions:
					${permissions.join(", ")}
				`),
                    allowedMentions: {}
                });
                break;
        }
        async function purgeMessages(messages, channel) {
            if (messages.size > 100) {
                let numDeleted = 0;
                while (numDeleted < messages.size) {
                    const batch = messages.map(message => message.id).slice(numDeleted, numDeleted + 100);
                    await channel?.bulkDelete(batch, true);
                    numDeleted += batch.length;
                }
            }
            else {
                await channel.bulkDelete(messages, true);
            }
        }
    }
};
