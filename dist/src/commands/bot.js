"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const general_1 = __importDefault(require("../utilities/general"));
const boot_1 = __importDefault(require("../services/boot"));
const modules_1 = __importDefault(require("../utilities/modules"));
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("bot")
        .setDescription("Manages the bot.")
        .setDefaultMemberPermissions(0)
        .setDescription("Manage the bots operational status.")
        .addSubcommand(SlashCommandSubcommandBuilder => SlashCommandSubcommandBuilder
        .setName("shutdown")
        .setDescription("Shuts down the bot."))
        .addSubcommand(SlashCommandSubcommandBuilder => SlashCommandSubcommandBuilder
        .setName("restart")
        .setDescription("Restarts the bot."))
        .addSubcommand(SlashCommandSubcommandBuilder => SlashCommandSubcommandBuilder
        .setName("reload")
        .setDescription("Reloads a command(s) or event(s).")
        .addStringOption(SlashCommandStringOption => SlashCommandStringOption
        .setName("module")
        .setDescription("The module to reload. Use 'all-commands' or 'all-events' to reload all commands or events.")
        .setRequired(true)))
        .addSubcommand(SlashCommandSubcommandBuilder => SlashCommandSubcommandBuilder
        .setName("discord-status")
        .setDescription("Updates the bot's Discord status.")
        .addStringOption(SlashCommandStringOption => SlashCommandStringOption
        .setName("status")
        .setDescription("The status to set.")
        .setRequired(true)
        .addChoices({
        name: "Online",
        value: "online"
    }, {
        name: "Idle",
        value: "idle"
    }, {
        name: "Do not disturb",
        value: "dnd"
    }, {
        name: "Invisible(Offline)",
        value: "invisible"
    }))
        .addStringOption(SlashCommandStringOption => SlashCommandStringOption
        .setName("type")
        .setDescription("The status type to set.")
        .setRequired(false)
        .addChoices({
        name: "Playing",
        value: "Playing"
    }, {
        name: "Listening",
        value: "Listening"
    }, {
        name: "Competing",
        value: "Competing"
    }, {
        name: "Watching",
        value: "Watching"
    }))
        .addStringOption(SlashCommandStringOption => SlashCommandStringOption
        .setName("text")
        .setDescription("The status text to set.")
        .setRequired(false))),
    async execute(interaction) {
        if (!interaction.isChatInputCommand() || !interaction.inCachedGuild())
            return;
        if (!general_1.default.isBotOwner(interaction.user.id)) {
            interaction.reply({
                content: "You do not have permission to use this command.",
                ephemeral: true
            });
            return;
        }
        const subcommand = interaction.options.getSubcommand();
        const module = interaction.options.getString("module");
        const status = interaction.options.getString("status");
        const inputtedType = interaction.options.getString("type");
        const inputtedText = interaction.options.getString("text");
        switch (subcommand) {
            case "shutdown":
                interaction.reply({
                    content: "Shutting down. This message will not update. Goodbye"
                });
                boot_1.default.shutdown();
                break;
            case "restart":
                interaction.reply({
                    content: "Restarting. This message will not update. Goodbye"
                });
                boot_1.default.restart();
                break;
            case "reload":
                switch (module) {
                    case "all-commands":
                        interaction.reply({
                            content: "Reloading all commands."
                        });
                        await modules_1.default.reload("n-a", "command", true);
                        interaction.editReply({
                            content: "Reloaded all commands."
                        });
                        break;
                    case "all-events":
                        interaction.reply({
                            content: "Reloading all events."
                        });
                        await modules_1.default.reload("n-a", "event", true);
                        interaction.editReply({
                            content: "Reloaded all events."
                        });
                        break;
                }
                if (!module)
                    return;
                interaction.reply({
                    content: `Reloading ${module}.`
                });
                await modules_1.default.reload(module, "command", false);
                interaction.editReply({
                    content: `Reloaded ${module}.`
                });
                break;
            case "discord-status":
                await interaction.reply({
                    content: "Setting status...",
                    ephemeral: true,
                });
                if (!status) {
                    await interaction.editReply({
                        content: "Missing status.",
                    });
                    return;
                }
                if (status === "invisible" && (inputtedType || inputtedText)) {
                    await interaction.editReply({
                        content: "You cannot set an activity when the status is invisible.",
                    });
                    return;
                }
                if (inputtedType && !inputtedText || !inputtedType && inputtedText) {
                    await interaction.editReply({
                        content: "If you provide an activity type, you must also provide an activity text.",
                    });
                    return;
                }
                await interaction.client.user?.setPresence({
                    activities: inputtedType && inputtedText ? [{
                            name: inputtedText,
                            // eslint-disable-next-line security/detect-object-injection
                            type: discord_js_1.ActivityType[inputtedType],
                        }] : [],
                    status: status,
                });
                await interaction.editReply({
                    content: "Status set.\nIt may take some time for the change(s) to appear because of Discord's rate limits.",
                });
                break;
        }
    }
};
