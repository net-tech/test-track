/* eslint-disable indent */
import { bgMagentaBright } from "colorette"
import * as dotenv from "dotenv"
import { log } from "./logger"
import util from "../utilities/general"
import { exec } from "child_process"
import packageFile from "../../package.json"
import { PrismaClient } from "@prisma/client"
dotenv.config()

let prisma: PrismaClient | null = null

/**
 * Contains core functions of the bot that provide vital functionality.
 */
class boot {
	/**
	 * Initializes the logger and sentry on the correct environment and checks for any missing environment variables. Connects to the database.
	 * @returns {Promise<void>}
	 * @error Quits the process on error.
	 */
	public static async init(): Promise<void> {

		const environment = process.env.NODE_ENV
		if (!environment) {
			log.fatal("NODE_ENV environment variable is not set")
			boot.exit(1)
		}

		switch (true) {
			case !process.env.DISCORD_TOKEN:
				log.fatal("DISCORD_TOKEN is not set in .env")
				boot.exit(1)
				break
			case !process.env.CLIENT_ID:
				log.fatal("CLIENT_ID is not set in .env")
				boot.exit(1)
				break
			case util.decodeBase64(process.env.DISCORD_TOKEN?.split(".")[0] as string) !== process.env.CLIENT_ID:
				log.fatal("Client ID found in DISCORD_TOKEN and CLIENT_ID do not match.")
				boot.exit(1)
				break
			case !process.env.DATABASE_URL_DEV && !process.env.DATABASE_URL_PROD:
				log.fatal("Neither DATABASE_URL_DEV or DATABASE_URL_PROD are set in .env")
				boot.exit(1)
				break
		}

		prisma = new PrismaClient()

		log.info(`Passed boot checks successfully. Starting in ${bgMagentaBright(boot.environment())} mode.`)

	}

	/**
	 * Gives the current environment the bot is running in. If not set, it will return "development".
	 * @returns {string} The environment the bot is running in.
	 */
	public static environment(): string {
		return process.env.NODE_ENV ?? "development"
	}

	/**
	 * Exists the process with the given code. If no code is given, it will exit with code 0.
	 * @param {number} [code=0] The exit code.
	 * @returns {void}
	 */
	public static exit(code=0): void {
		log.fatal(`Exiting with code ${code ?? 0}. Exit Function Called.`)
		process.exit(code)
	}

	/**
	 * Gets the name of the bot from the package.json file.
	 * @returns {string} The name of the bot.
	 */
	public static botName(): string {
		return packageFile.name
	}

	/**
	 * Shuts down the bot. Only works with PM2.
	 */
	public static shutdown(): void {
		log.info("Shutdown issued. Stopping bot.")
		exec(`pm2 stop ${boot.botName()}`)
	}

	/**
	 * Restarts the bot. Only works with PM2.
	 * @todo param {string} updateMessageGuildId The Discord guild ID of the update message.
	 * @todo param {string} updateMessageChannelId The Discord channel ID of the update channel.
	 * @todo param {string} updateMessageId The Discord message ID of the update message.
	 */
	public static restart(): void {
		log.info("Restart issued. Restarting bot.")
		exec(`pm2 restart ${boot.botName()} --env ${boot.environment()}`)
	}

	/**
	 * Gets the Prisma client.
	 * @returns {PrismaClient} The Prisma client.
	 */
	public static prisma(): PrismaClient {
		if (!prisma) {
			prisma = new PrismaClient()
		}
		return prisma
	}
}

export default boot