"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const re2_1 = __importDefault(require("re2"));
const antiphish_1 = __importDefault(require("../services/antiphish"));
const logger_1 = require("../services/logger");
const sentry_1 = __importDefault(require("../services/sentry"));
const messages_1 = require("../types/messages");
const antiphish_2 = __importDefault(require("../utilities/antiphish"));
const general_1 = __importDefault(require("../utilities/general"));
const whoiser_1 = __importDefault(require("whoiser"));
const axios_1 = __importDefault(require("axios"));
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("lookup")
        .setDescription("Lookup information about a target like a user.")
        .addStringOption(SlashCommandStringOption => SlashCommandStringOption
        .setName("target")
        .setDescription("The target to lookup. Can be a invite, guild id, user id, domain, or IP address.")
        .setRequired(true)),
    async execute(interaction) {
        if (!interaction.isChatInputCommand() || !interaction.inCachedGuild())
            return;
        const target = interaction.options.getString("target", true);
        /* Misc */
        const { client } = interaction;
        const inviteRegex = new re2_1.default(messages_1.Regex.Invite);
        const domainRegex = new re2_1.default(messages_1.Regex.Domain);
        const ipRegex = new re2_1.default(messages_1.Regex.Ip);
        const idRegex = new re2_1.default(messages_1.Regex.Id);
        const messageAttachments = [];
        let ipInfoEmbed = new discord_js_1.EmbedBuilder();
        /* Invite */
        let inviteInfoEmbed = new discord_js_1.EmbedBuilder();
        let invite = null;
        let guildBlacklist = false;
        const actionRowGuild = new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.ButtonBuilder()
            .setLabel("View All Features")
            .setStyle(discord_js_1.ButtonStyle.Primary)
            .setCustomId("view-all-features"));
        /* Domain */
        let isPhishing = false;
        let domainInfoEmbed = new discord_js_1.EmbedBuilder();
        let whoisData;
        /* ID */
        const questionRow = new discord_js_1.ActionRowBuilder()
            .addComponents(new discord_js_1.ButtonBuilder()
            .setLabel("Guild ID")
            .setStyle(discord_js_1.ButtonStyle.Primary)
            .setCustomId("guild-id"), new discord_js_1.ButtonBuilder()
            .setLabel("User ID")
            .setStyle(discord_js_1.ButtonStyle.Primary)
            .setCustomId("user-id"));
        await interaction.deferReply();
        switch (true) {
            case inviteRegex.test(target):
                invite = await client.fetchInvite(target)
                    .catch((err) => {
                    interaction.editReply({
                        content: "Error while fetching invite."
                    });
                    logger_1.log.error(err, "Error while fetching invite.");
                });
                if (!invite || !invite.guild)
                    return;
                guildBlacklist = await sentry_1.default.isBlacklistedGuild(invite.guild.id);
                inviteInfoEmbed = new discord_js_1.EmbedBuilder()
                    .setTitle(`${invite.guild.name} (${invite.guild.id})`)
                    .setThumbnail(invite.guild.iconURL({ size: 4096 }))
                    .addFields([
                    {
                        name: "Invite",
                        value: (0, common_tags_1.stripIndents) `
							> Vanity URL: ${invite.guild.vanityURLCode ?? "N/A"}
							> URL: ${invite.url ?? "Unknown"}
							> Uses: ${invite.uses ?? "Unknown"}
							> Channel: ${invite.channel?.name ?? "Unknown"} (${invite.channel?.id ?? "Unknown"})
							`,
                        inline: false
                    },
                    {
                        name: "Guild",
                        value: (0, common_tags_1.stripIndents) `
							> Creation Date: ${general_1.default.generateTimestamp("F", invite.guild.createdAt, undefined, true)}
							> NSFW Level: ${invite.guild.nsfwLevel ?? "Unknown"}
							> Verification Level: ${invite.guild.verificationLevel ?? "Unknown"}
							`,
                        inline: false
                    },
                    {
                        name: "Members",
                        value: (0, common_tags_1.stripIndents) `
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
                });
                if (invite.guild.banner) {
                    inviteInfoEmbed.setImage(invite.guild.bannerURL({ size: 4096 }) ?? "");
                    inviteInfoEmbed.addFields([
                        {
                            name: "Banner",
                            value: "** **",
                        }
                    ]);
                }
                if (guildBlacklist) {
                    inviteInfoEmbed.setAuthor({
                        name: `${guildBlacklist}`,
                        iconURL: messages_1.Icon.Cross
                    });
                    inviteInfoEmbed.setColor(messages_1.Color.Red);
                }
                else {
                    inviteInfoEmbed.setAuthor({
                        name: "Not Blacklisted",
                        iconURL: messages_1.Icon.Check
                    });
                    inviteInfoEmbed.setColor(messages_1.Color.Green);
                }
                await client.fetchGuildWidget(invite.guild.id)
                    .then(async (widget) => {
                    const membersList = widget.members.map((member) => {
                        return `${member.username}#${member.discriminator} (${member.id})`;
                    });
                    const channelList = widget.channels.map((channel) => {
                        return `Position ${channel.position} - ${channel.name} (${channel.id})`;
                    });
                    messageAttachments.push(new discord_js_1.AttachmentBuilder(Buffer.from(membersList.join("\n")), {
                        name: "members.txt",
                    }));
                    messageAttachments.push(new discord_js_1.AttachmentBuilder(Buffer.from(channelList.join("\n")), {
                        name: "channels.txt",
                    }));
                })
                    .catch(() => {
                    inviteInfoEmbed.addFields([
                        {
                            name: "Widget",
                            value: "Unable to fetch widget. Likely due to the guild not having a widget enabled.",
                        }
                    ]);
                });
                await interaction.editReply({
                    embeds: [inviteInfoEmbed],
                    components: [actionRowGuild],
                    files: messageAttachments ?? [],
                });
                if (!guildBlacklist)
                    interaction.channel?.send("</bulk blacklist-guilds:1054085581086396498>");
                break;
            case domainRegex.test(target):
                isPhishing = await antiphish_1.default.isPhishing(target);
                whoisData = firstResult(await (0, whoiser_1.default)(target));
                if (!whoisData) {
                    interaction.editReply({
                        content: "Unable to find domain info.",
                        components: [],
                    });
                    return;
                }
                if (typeof whoisData === "object") {
                    delete whoisData.text;
                }
                domainInfoEmbed = new discord_js_1.EmbedBuilder()
                    .setTitle(`Domain Info - ${antiphish_2.default.defangURL(target)}`)
                    .setAuthor({
                    name: isPhishing ? "Phishing" : "Not Phishing",
                    iconURL: isPhishing ? messages_1.Icon.Cross : messages_1.Icon.Check,
                })
                    .setDescription(`\`\`\`json\n${JSON.stringify(whoisData, null, 4)}\n\`\`\``)
                    .setColor(isPhishing ? messages_1.Color.Red : messages_1.Color.Green);
                await interaction.editReply({
                    embeds: [domainInfoEmbed],
                });
                break;
            case ipRegex.test(target):
                whoisData = await (0, whoiser_1.default)(target);
                if (!whoisData) {
                    interaction.editReply({
                        content: "Unable to find IP info.",
                        components: [],
                    });
                    return;
                }
                if (typeof whoisData === "object") {
                    delete whoisData.text;
                }
                ipInfoEmbed = new discord_js_1.EmbedBuilder()
                    .setTitle(`IP Info - ${target}`)
                    .setDescription(`\`\`\`json\n${JSON.stringify(whoisData, null, 4)}\n\`\`\``)
                    .setColor(messages_1.Color.Blue);
                await interaction.editReply({
                    embeds: [ipInfoEmbed],
                });
                break;
            case idRegex.test(target):
                interaction.editReply({
                    content: "What type of ID is this?",
                    components: [questionRow],
                });
                // eslint-disable-next-line no-case-declarations
                const questionCollector = interaction.channel?.createMessageComponentCollector({
                    filter: (i) => i.user.id === interaction.user.id,
                    time: 30000,
                });
                questionCollector?.on("collect", async (i) => {
                    await i.deferUpdate();
                    if (i.customId === "user-id") {
                        questionCollector.stop("user-id");
                        i.editReply({
                            content: "",
                            embeds: [await infoUser(target)],
                            components: [],
                        });
                    }
                    else if (i.customId === "guild-id") {
                        questionCollector.stop("guild-id");
                        await infoGuild(target, i);
                    }
                });
                questionCollector?.on("end", async (collected, reason) => {
                    if (reason === "time") {
                        await interaction.editReply({
                            content: "Timed out.",
                            components: [],
                        });
                    }
                });
                break;
            default:
                await interaction.editReply({
                    content: "Unknown target type."
                });
                break;
        }
        async function infoUser(id) {
            const user = await client.users.fetch(id);
            const inGuild = await interaction.guild?.members.fetch(id)
                .catch(() => false);
            const flagsStrings = user.flags?.toArray().map((flag) => flag.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())) ?? [];
            if (user.flags?.bitfield & 1 << 20)
                flagsStrings.push("Spammer");
            const blacklistInfo = await sentry_1.default.isBlacklistedUser(user.id);
            const infoEmbed = new discord_js_1.EmbedBuilder()
                .setTitle(`Global User Info - ${user.tag}`)
                .setDescription((0, common_tags_1.stripIndents) `
					**ID:** ${user.id}
					**Username:** ${user.username}
					**Discriminator:** ${user.discriminator}
					**Bot:** ${user.bot ? "Yes" : "No"}
					**Creation Date:** ${general_1.default.generateTimestamp("F", user.createdAt, undefined, true)}
					**Discord System Component:** ${user.system ? "Yes" : "No"}
					**Flags:** ${user.flags?.bitfield} (${flagsStrings} )
					**In Guild:** ${inGuild ? "Yes" : "No"}
				`)
                .setThumbnail(user.avatarURL({ size: 4096 }) ?? user.defaultAvatarURL)
                .addFields([
                {
                    name: `Background Check ${blacklistInfo.dangerous ? "" : "- OK"}`,
                    value: `${sentry_1.default.formatBlacklistResponse(blacklistInfo)}`,
                }
            ])
                .setColor(blacklistInfo.dangerous ? messages_1.Color.Red : messages_1.Color.Green);
            if (user.bannerURL()) {
                infoEmbed.setImage(user.bannerURL({ size: 4096 }));
                infoEmbed.addFields([
                    {
                        name: "Banner",
                        value: "** **",
                    }
                ]);
            }
            return infoEmbed;
        }
        async function infoGuild(id, interaction) {
            if (interaction.isAutocomplete()) {
                return Error("Unexpected autocomplete interaction");
            }
            const isBlacklisted = await sentry_1.default.isBlacklistedGuild(id);
            const status = await axios_1.default.get(`https://discord.com/api/guilds/${id}/widget.json`)
                .then(() => {
                return 1;
            })
                .catch((err) => {
                console.log(err);
                if (err.response.status === 403)
                    return 2;
                if (err.response.status === 404)
                    return 3;
                return err.response.status;
            });
            return await client.fetchGuildWidget(id)
                .then(async (widget) => {
                const infoEmbed = new discord_js_1.EmbedBuilder()
                    // @ts-expect-error As of djs 14.7.1, this is not typed
                    .setTitle(`Global Guild Info - ${widget.name}`)
                    .setDescription((0, common_tags_1.stripIndents) `
							**ID:** ${widget.id}${ /* @ts-expect-error As of djs 14.7.1, this is not typed */""}
							**Name:** ${widget.name}
							**Online Members:** ${widget.presenceCount}
							**Instant Invite:** ${widget.instantInvite ?? "None"}
							**Creation Date:** ${general_1.default.generateTimestampFromSnowflake("F", widget.id, true)}
							`);
                if (widget.instantInvite) {
                    infoEmbed.addFields([
                        {
                            name: "Tip",
                            value: "You can use the lookup command and pass the instant invite to get more info about the guild.",
                        }
                    ]);
                }
                if (guildBlacklist) {
                    infoEmbed.setAuthor({
                        name: `${guildBlacklist}`,
                        iconURL: messages_1.Icon.Cross
                    });
                    infoEmbed.setColor(messages_1.Color.Red);
                }
                else {
                    infoEmbed.setAuthor({
                        name: "Not Blacklisted",
                        iconURL: messages_1.Icon.Check
                    });
                    infoEmbed.setColor(messages_1.Color.Green);
                }
                const membersList = widget.members.map((member) => {
                    return `${member.username}#${member.discriminator} (${member.id})`;
                });
                const channelList = widget.channels.map((channel) => {
                    return `Position ${channel.position} - ${channel.name} (${channel.id})`;
                });
                messageAttachments.push(new discord_js_1.AttachmentBuilder(Buffer.from(membersList.join("\n")), {
                    name: "members.txt",
                }));
                messageAttachments.push(new discord_js_1.AttachmentBuilder(Buffer.from(channelList.join("\n")), {
                    name: "channels.txt",
                }));
                // Couldn't figure out how to pass the attachments to the embed so just directly editing the interaction here	
                interaction.editReply({
                    embeds: [infoEmbed],
                    files: messageAttachments,
                    components: [],
                    content: null,
                });
            })
                .catch(async (err) => {
                const infoEmbed = new discord_js_1.EmbedBuilder()
                    .setTitle(`${status === 2 ? "Guild exists - widget disabled" : "Guild does not exist"}`)
                    .setDescription((0, common_tags_1.stripIndents) `
							Provided Snowflake Date: ${general_1.default.generateTimestampFromSnowflake("F", id, true)}
						`)
                    .addFields([
                    {
                        name: "Error",
                        value: `${(0, discord_js_1.codeBlock)(err)}`
                    }
                ]);
                if (isBlacklisted) {
                    infoEmbed.setAuthor({
                        name: `${isBlacklisted}`,
                        iconURL: messages_1.Icon.Cross
                    });
                    infoEmbed.setColor(messages_1.Color.Red);
                }
                else {
                    infoEmbed.setAuthor({
                        name: "Not Blacklisted",
                        iconURL: messages_1.Icon.Check
                    });
                    infoEmbed.setColor(messages_1.Color.Green);
                }
                // Couldn't figure out how to pass the attachments to the embed so just directly editing the interaction here	
                interaction.editReply({
                    embeds: [infoEmbed],
                    files: messageAttachments,
                    components: [],
                    content: null,
                });
            });
        }
        function firstResult(whoisResults) {
            const whoisServers = Object.keys(whoisResults);
            return whoisServers.length ? whoisResults[whoisServers[0]] : null;
        }
    }
};
