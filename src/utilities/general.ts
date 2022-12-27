import axios from "axios"
import post from "axios"
import { Client, Invite, TimestampStylesString, BaseMessageOptions, Message } from "discord.js"
import RE2 from "re2"

/**
 * Provides general utility functions which cannot be categorized.
 */
class util {
	/**
	 * Decodes a base64 string.
	 * @param {string} base64String The base64 string to decode.
	 * @returns {string} The decoded string.
	 */
	public static decodeBase64(base64String: string): string {
		return Buffer.from(base64String, "base64").toString("ascii")
	}

	/**
	 * Uploads text to a hastebin instance.
	 * @param {string} text The text to upload.
	 * @param {string?} extension The extension to use for the file. Defaults to "txt".
	 */
	public static async uploadToHastebin(text: string, extension?: string): Promise<string> {
		return await post("https://hst.sh/documents", {
			data: text
		})
			.then((res) => {
				return `https://hst.sh/${res.data.key}.${extension ?? "txt"}`
			})
			.catch((err) => {
				console.error(err)
				return "Failed to upload to hastebin."
			})
	}

	/**
	 * Parses a guild ID from a invite.
	 * @param {client} client The client to use.
	 * @param {string} invite The invite to parse.
	 * @returns {string | null} The guild ID, or null if the invite is invalid.
	 */
	public static async parseGuildIDFromInvite(client: Client, invite: string): Promise<string | null> {

		// eslint-disable-next-line security/detect-unsafe-regex
		const inviteRegex = new RE2(/((?:https?:\/\/)?discord(?:(?:app)?.com\/invite\/|.gg\/)[A-Za-z0-9]{2,})/gmi)

		if (!inviteRegex.test(invite)) {
			return null
		}

		return client.fetchInvite(invite)
			.then((fetchedInvite: Invite) => {
				if (!fetchedInvite.guild) return null
				return fetchedInvite.guild?.id as string
			})
			.catch(() => {
				return null
			})
	}

	/**
	 * Generates a Discord Timestamp.
	 * @param {TimestampStylesString} style The style to use for the timestamp.
	 * @param {Date} date The date to use for the timestamp.
	 * @param {number} timestamp The timestamp to use for the timestamp.
	 * @param {boolean} addRelative If true, the relative time will be added to the timestamp.
	 * @returns The generated timestamp.
	 */
	public static generateTimestamp(style: TimestampStylesString, date?: Date, timestamp?: number, addRelative?: boolean): string {
		const secondsTimestamp = date
			? Math.round(date.getTime() / 1000)
			: timestamp
				? Math.round(timestamp / 1000)
				: 0
		if (!secondsTimestamp) {
			throw new Error("No timestamp/date provided.")
		}
		return `<t:${secondsTimestamp}:${style}>${addRelative ? ` (<t:${secondsTimestamp}:R>)` : ""}`
	}

	/**
	 * Generates a Discord Timestamp from a Discord snowflake.
	 * @param {TimestampStylesString} style The style to use for the timestamp.
	 * @param {string} snowflake The snowflake to use for the timestamp.
	 * @param {boolean} addRelative If true, the relative time will be added to the timestamp.
	 * @param {boolean} raw If true, the raw timestamp will be returned.
	 * @returns {string} The generated timestamp.
	 */
	public static generateTimestampFromSnowflake(style: TimestampStylesString, snowflake: string, addRelative: boolean, raw?: boolean): string {
		if (raw) return Math.round((parseInt(snowflake) / 4194304 + 1420070400000) / 1000).toString()
		return this.generateTimestamp(style, new Date(parseInt(snowflake) / 4194304 + 1420070400000), undefined, addRelative)
	}

	/**
	 * Sends a message to a guild channel.
	 * @param {Client} client The client to use.
	 * @param {string} guildID The ID of the guild to send the message to.
	 * @param {string} channelID The ID of the channel to send the message to.
	 * @param {BaseMessageOptions} message The message to send.
	 * @returns {Promise<Message | null>} The sent message, or null if the channel was not found.
	 */
	public static async sendGuildMessage(client: Client, guildID: string, channelID: string, message: BaseMessageOptions): Promise<Message | null> {
		const guild = await client.guilds.fetch(guildID)
		if (!guild) return null
		const channel = await guild.channels.fetch(channelID)
		if (!channel) return null
		if(!channel.isTextBased()) return null
		return await channel.send(message)
	}

	/**
	 * Get file data from a Discord CDN URL.
	 * @param {string} url The URL to get data from.
	 * @returns {Promise<string>} The data from the URL.
	 */
	public static async getFileDataFromCDN(url: string): Promise<string> {
		return await axios.get(url)
			.then((res) => {
				return res.data
			})
			.catch((err) => {
				console.error(err)
				return "Failed to get file data from CDN."
			})
	}



}

export default util