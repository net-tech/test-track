import { bgMagentaBright } from "colorette"
import { Client, Events } from "discord.js"
import boot from "../services/boot"
import { log } from "../services/logger"

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client: Client) {

		const environment = boot.environment()
		const guilds = client.guilds.cache.map((guild) => `${guild.name} - ${guild.id}`).join("\n")

		log.info(
			`Client ready with ${client.users.cache.size} users across ${client.guilds.cache.size} guilds in ${bgMagentaBright(environment)} mode.\n\n${guilds}`
		)

	},
}
