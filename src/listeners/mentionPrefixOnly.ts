import { Listener } from "@sapphire/framework"
import { ChannelType, Message } from "discord.js"

export class UserEvent extends Listener {
	public async run(message: Message) {
		if (message.channel.type === ChannelType.GuildStageVoice) return
		const prefix = this.container.client.options.defaultPrefix
		return message.channel.send(
			prefix
				? `My prefix in this guild is: \`${prefix}\``
				: "Cannot find any Prefix for Message Commands."
		)
	}
}
