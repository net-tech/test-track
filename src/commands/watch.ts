import { CommandInteraction, SlashCommandBuilder } from "discord.js"
import Security from "../services/security"
import Database from "../utilities/database"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("watch")
		.setDescription("Manage the user watch list.")
		.addSubcommand(SlashCommandSubcommandBuilder =>
			SlashCommandSubcommandBuilder
				.setName("add")
				.setDescription("Add a user to the watch list.")
				.addStringOption(SlashCommandStringOption =>
					SlashCommandStringOption
						.setName("id")
						.setDescription("The ID of the user to watch.")
						.setRequired(true)
				)
				.addStringOption(SlashCommandStringOption =>
					SlashCommandStringOption
						.setName("reason")
						.setDescription("The reason for adding this user.")
						.setRequired(false)
				)
		)
		.addSubcommand(SlashCommandSubcommandBuilder =>
			SlashCommandSubcommandBuilder
				.setName("remove")
				.setDescription("Remove a user to the watch list.")
				.addStringOption(SlashCommandStringOption =>
					SlashCommandStringOption
						.setName("id")
						.setDescription("The ID of the user to watch.")
						.setRequired(true)
				)
		)
		.addSubcommand(SlashCommandSubcommandBuilder =>
			SlashCommandSubcommandBuilder
				.setName("list")
				.setDescription("List the users on the watch list.")
		),
	async execute(interaction: CommandInteraction) {
		if (!interaction.isChatInputCommand() || !interaction.inCachedGuild() || !interaction.guild || !interaction.channel) return

		if (!Security.isEvalerUser(interaction.user)) {
			interaction.reply({
				content: "You do not have permission to use this command.",
				ephemeral: true
			})
			return
		}

		const subcommand = interaction.options.getSubcommand()

		const id = interaction.options.getString("id")
		const reason = interaction.options.getString("reason") ?? undefined

		await interaction.deferReply()

		switch (subcommand) {
		case "add":
			if (!id) return

			if (!await interaction.client.users.fetch(id)) {
				interaction.editReply({
					content: "I could not fetch a user with that ID."
				})
			}

			// eslint-disable-next-line no-case-declarations
			const userFetch = await interaction.client.users.fetch(id)

			await Database.createWatchedUser(userFetch, interaction.user.id, reason)
				.then(() => {
					interaction.editReply({
						content: `Added ${userFetch.tag} to the watch list.`
					})
				})
				.catch((error) => {
					interaction.editReply({
						content: `There was an error adding ${userFetch.tag} to the watch list.\n\n\`\`\`${error}\`\`\``
					})
				})

			break
		case "remove":
			if (!id) return

			if (!await interaction.client.users.fetch(id)) {
				interaction.editReply({
					content: "I could not fetch a user with that ID."
				})
			}

			// eslint-disable-next-line no-case-declarations
			const userFetchRemove = await interaction.client.users.fetch(id)

			await Database.removeWatchedUser(userFetchRemove)
				.then((bool) => {
					if (bool) {
						interaction.editReply({
							content: `Removed ${userFetchRemove.tag} from the watch list.`
						})
					} else {
						interaction.editReply({
							content: `Failed to remove ${userFetchRemove.tag} from the watch list.`
						})
					}
				})
				.catch((error) => {
					interaction.editReply({
						content: `There was an error removing ${userFetchRemove.tag} from the watch list.\n\n\`\`\`${error}\`\`\``
					})
				})

			break
		case "list":

			await Database.getWatchedUsers()
				.then((users) => {
					if (users.length === 0) {
						interaction.editReply({
							content: "There are no users on the watch list."
						})
						return
					}

					const usersList = users.map((user) => {
						return `<@${user.userId}> - ${user.username}#${user.discriminator} - ${user.userId} - ${user.reason ?? "No reason provided."}`
					})

					interaction.editReply({
						content: `There are ${users.length} users on the watch list.\n\n${usersList.join("\n")}`
					})
				})
				.catch((error) => {
					interaction.editReply({
						content: `There was an error fetching the watch list.\n\n\`\`\`${error}\`\`\``
					})
				})
			break
		}
	}
}