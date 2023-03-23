import "./lib/setup.js"
import { LogLevel, SapphireClient } from "@sapphire/framework"
import { ActivityType, GatewayIntentBits, Partials } from "discord.js"
import * as dotenv from "dotenv"
import { GlobalKill } from "global-kill"
dotenv.config()

const client = new SapphireClient({
	defaultPrefix: process.env.DEFAULT_PREFIX,
	caseInsensitiveCommands: true,
	logger: {
		level: LogLevel.Debug
	},
	shards: "auto",
	intents: [
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.MessageContent
	],
	partials: [Partials.Channel],
	loadMessageCommandListeners: true,
	presence: {
		status: "online",
		activities: [
			{
				name: "with the API",
				type: ActivityType.Playing
			}
		]
	}
})

const main = async () => {
	try {
		client.logger.info("Logging in")
		await client.login(process.env.DISCORD_TOKEN)
		new GlobalKill.module("bench")
		new GlobalKill.module("eval")
		client.logger.info(
			`Logged in as ${client.user?.username ?? "unknown name"}`
		)
	} catch (error) {
		client.logger.fatal(error)
		client.destroy()
		process.exit(1)
	}
}

process.on("SIGKILL", () => {
	client.logger.info("Received SIGKILL signal, exiting")
	client.destroy()
	process.exit(0)
})

main()
