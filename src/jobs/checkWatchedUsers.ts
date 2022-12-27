import { Client, EmbedBuilder, User } from "discord.js"
import { Color } from "../types/messages"
import Database from "../utilities/database"
import util from "../utilities/general"

export async function checkWatchedUsers(client: Client) {
	const watchedUsers = await Database.getWatchedUsers()

	for await (const user of watchedUsers) {
		const discordUser = await client.users.fetch(user.userId)
		await discordUser.fetchFlags()

		if (!discordUser) continue

		if (discordUser.username !== user.username) handleUserUpdate("username", user.username, discordUser.username, discordUser)
		if (discordUser.discriminator !== user.discriminator) handleUserUpdate("discriminator", user.discriminator, discordUser.discriminator, discordUser)
		if (discordUser.avatarURL() !== user.avatarURL) handleUserUpdate("avatarURL", user.avatarURL, discordUser.avatarURL() ?? discordUser.defaultAvatarURL, discordUser)
		if ((discordUser.flags?.bitfield ?? 0) !== user.flags) handleUserUpdate("flags", user.flags ?? 0, discordUser.flags?.bitfield ?? 0, discordUser)
	}
}

async function handleUserUpdate(changedValue: string, oldValue: string | number, newValue: string | number, user: User) {
	await Database.updateWatchedUser(user)

	const alertEmbed = new EmbedBuilder()
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
		.setColor(Color.Red)

	util.sendGuildMessage(user.client, "828962734938652752", "967500733677199370", {
		content: `${process.env.OWNER_ID}`,
		embeds: [alertEmbed]
	})
}