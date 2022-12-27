"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = __importDefault(require("node:fs"));
const logger_1 = require("../services/logger");
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
    static async reload(module, type, all) {
        if (all) {
            if (type === "command") {
                const commandFiles = node_fs_1.default.readdirSync("./src/commands").filter(file => file.endsWith(".js"));
                logger_1.log.info(`Reloading ${commandFiles.length} commands.`);
                for await (const file of commandFiles) {
                    await delete require.cache[require.resolve(`../commands/${file}`)];
                    logger_1.log.info(`Reloaded command '${file}'.`);
                }
                logger_1.log.info("Reloaded all commands.");
                return "Reloaded all commands.";
            }
            else if (type === "event") {
                const eventFiles = node_fs_1.default.readdirSync("./src/events").filter(file => file.endsWith(".js"));
                logger_1.log.info(`Reloading ${eventFiles.length} events.`);
                for await (const file of eventFiles) {
                    await delete require.cache[require.resolve(`../events/${file}`)];
                    logger_1.log.info(`Reloaded event '${file}'.`);
                }
                logger_1.log.info("Reloaded all events.");
                return "Reloaded all events.";
            }
        }
        else {
            if (type === "command") {
                logger_1.log.info(`Reloading command '${module}'.`);
                await delete require.cache[require.resolve(`../commands/${module}.js`)];
                logger_1.log.info(`Reloaded command '${module}'.`);
                return `Reloaded command '${module}'.`;
            }
            else if (type === "event") {
                logger_1.log.info(`Reloading event '${module}'.`);
                await delete require.cache[require.resolve(`../events/${module}.js`)];
                logger_1.log.info(`Reloaded event '${module}'.`);
                return `Reloaded event '${module}'.`;
            }
        }
        return "Error: Invalid type.";
    }
    /**
     * Lists the specified type of modules.
     * @param {"command" | "event"} type The type of module to list.
     * @returns {string[]} The modules.
     */
    static list(type) {
        if (type === "command") {
            const commandFiles = node_fs_1.default.readdirSync("./src/commands").filter(file => file.endsWith(".js"));
            return commandFiles;
        }
        else if (type === "event") {
            const eventFiles = node_fs_1.default.readdirSync("./src/events").filter(file => file.endsWith(".js"));
            return eventFiles;
        }
        return [];
    }
}
exports.default = Modules;
