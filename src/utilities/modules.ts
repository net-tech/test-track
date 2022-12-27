import fs from "node:fs"
import { log } from "../services/logger"

/**
 * Manages the bots modules.
 */
class Modules {
	/**
	 * Reloads a module.
	 * @param {string} module The module to reload.
	 * @param {"command" | "event"} type The type of module to reload.
	 * @param {boolean} all Whether to reload all modules.
	 * @returns {string} The status of the reload.
	 */
	public static async reload(module: string, type: "command" | "event", all: boolean): Promise<string> {
		if (all) {
			if (type === "command") {
				const commandFiles = fs.readdirSync("./src/commands").filter(file => file.endsWith(".js"))
				log.info(`Reloading ${commandFiles.length} commands.`)
				for await (const file of commandFiles) {
					await delete require.cache[require.resolve(`../commands/${file}`)]
					log.info(`Reloaded command '${file}'.`)
				}
				log.info("Reloaded all commands.")
				return "Reloaded all commands."
			} else if (type === "event") {
				const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"))
				log.info(`Reloading ${eventFiles.length} events.`)
				for await (const file of eventFiles) {
					await delete require.cache[require.resolve(`../events/${file}`)]
					log.info(`Reloaded event '${file}'.`)
				}
				log.info("Reloaded all events.")
				return "Reloaded all events."
			}
		} else {
			if (type === "command") {
				log.info(`Reloading command '${module}'.`)
				await delete require.cache[require.resolve(`../commands/${module}.js`)]
				log.info(`Reloaded command '${module}'.`)
				return `Reloaded command '${module}'.`
			} else if (type === "event") {
				log.info(`Reloading event '${module}'.`)
				await delete require.cache[require.resolve(`../events/${module}.js`)]
				log.info(`Reloaded event '${module}'.`)
				return `Reloaded event '${module}'.`
			}
		}
		return "Error: Invalid type."
	}

	/**
	 * Lists the specified type of modules.
	 * @param {"command" | "event"} type The type of module to list.
	 * @returns {string[]} The modules.
	 */
	public static list(type: "command" | "event"): string[] {
		if (type === "command") {
			const commandFiles = fs.readdirSync("./src/commands").filter(file => file.endsWith(".js"))
			return commandFiles
		} else if (type === "event") {
			const eventFiles = fs.readdirSync("./src/events").filter(file => file.endsWith(".js"))
			return eventFiles
		}
		return []
	}
}

export default Modules