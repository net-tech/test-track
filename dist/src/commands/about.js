"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const time_utilities_1 = require("@sapphire/time-utilities");
const package_json_1 = __importDefault(require("../../package.json"));
const messages_1 = require("../types/messages");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("about")
        .setDescription("Information about the bot."),
    async execute(interaction) {
        const wsPing = interaction.client.ws.ping;
        const uptime = new time_utilities_1.DurationFormatter().format(interaction.client.uptime);
        const infoEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("ARIA - A Rather Intelligent Assistant")
            .setDescription("I was created by net-tech-, originally as a testing dummy for the Discord API. Since then, I've grown to serve as a utility bot with features net-tech- needs. Yes, this was written by a human and I am not sentient. 'I' will address myself in the third person because it's funny. Intelligent features are powered by chatGPT.")
            .addFields({
            name: "Statistics",
            value: `Version: ${package_json_1.default.version}\nWebsocket Latency: ${wsPing}ms\nUptime: ${uptime}\nCreated by <@${process.env.OWNER_ID}>`
        })
            .setImage("https://media.discordapp.net/attachments/931672525375672410/994924984688443472/A.R.I.A_Values.png")
            .setColor(messages_1.Color.Grey);
        interaction.reply({
            embeds: [infoEmbed]
        });
    }
};
