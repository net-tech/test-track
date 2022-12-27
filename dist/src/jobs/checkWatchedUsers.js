"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkWatchedUsers = void 0;
const discord_js_1 = require("discord.js");
const messages_1 = require("../types/messages");
const database_1 = __importDefault(require("../utilities/database"));
const general_1 = __importDefault(require("../utilities/general"));
async function checkWatchedUsers(client) {
    const watchedUsers = await database_1.default.getWatchedUsers();
    for await (const user of watchedUsers) {
        const discordUser = await client.users.fetch(user.userId);
        await discordUser.fetchFlags();
        if (!discordUser)
            continue;
        if (discordUser.username !== user.username)
            handleUserUpdate("username", user.username, discordUser.username, discordUser);
        if (discordUser.discriminator !== user.discriminator)
            handleUserUpdate("discriminator", user.discriminator, discordUser.discriminator, discordUser);
        if (discordUser.avatarURL() !== user.avatarURL)
            handleUserUpdate("avatarURL", user.avatarURL, discordUser.avatarURL() ?? discordUser.defaultAvatarURL, discordUser);
        if ((discordUser.flags?.bitfield ?? 0) !== user.flags)
            handleUserUpdate("flags", user.flags ?? 0, discordUser.flags?.bitfield ?? 0, discordUser);
    }
}
exports.checkWatchedUsers = checkWatchedUsers;
async function handleUserUpdate(changedValue, oldValue, newValue, user) {
    await database_1.default.updateWatchedUser(user);
    const alertEmbed = new discord_js_1.EmbedBuilder()
        .setTitle(`Change detected on watched user ${user.tag}`)
        .setDescription(`The user ${user.tag} (${user.id}) has changed their ${changedValue}.`)
        .addFields([
        {
            name: "Old value",
            value: `${oldValue}`,
            inline: true
        },
        {
            name: "New value",
            value: `${newValue}`,
            inline: true
        }
    ])
        .setThumbnail(user.avatarURL() ?? user.defaultAvatarURL)
        .setTimestamp(new Date())
        .setColor(messages_1.Color.Red);
    general_1.default.sendGuildMessage(user.client, "828962734938652752", "967500733677199370", {
        content: `${process.env.OWNER_ID}`,
        embeds: [alertEmbed]
    });
}
