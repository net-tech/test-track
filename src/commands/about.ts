import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import { DurationFormatter } from "@sapphire/time-utilities"
import version from "../../package.json"
import { Color } from "../types/messages"

module.exports = {
	data: new SlashCommandBuilder()
		.setName("about")
		.setDescription("Information about the bot."),
	async execute(interaction: CommandInteraction) {
		const wsPing = interaction.client.ws.ping
		const uptime = new DurationFormatter().format(interaction.client.uptime)

		const infoEmbed = new EmbedBuilder()
			.setTitle("ARIA - A Rather Intelligent Assistant")
			.setDescription("I was created by net-tech-, originally as a testing dummy for the Discord API. Since then, I've grown to serve as a utility bot with features net-tech- needs. Yes, this was written by a human and I am not sentient. 'I' will address myself in the third person because it's funny. Intelligent features are powered by chatGPT.")
			.addFields({
				name: "Statistics",
				value: `Version: ${version.version}\nWebsocket Latency: ${wsPing}ms\nUptime: ${uptime}\nCreated by <@${process.env.OWNER_ID}>`
			})
			.setImage("https://media.discordapp.net/attachments/931672525375672410/994924984688443472/A.R.I.A_Values.png")
			.setColor(Color.Grey)

		interaction.reply({
			embeds: [infoEmbed]
		})
	}
}