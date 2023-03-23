// rome-ignore lint/correctness/noUnusedVariables: decorator
import { ApplyOptions } from "@sapphire/decorators"
import { Command } from "@sapphire/framework"
import { send } from "@sapphire/plugin-editable-commands"
import type { Message } from "discord.js"

@ApplyOptions<Command.Options>({
	description: 'ping pong'
})
export class UserCommand extends Command {
	public async messageRun(message: Message) {
		const msg = await send(message, "Ping?")

		return send(
			message,
			`Test track websocket latency ${Math.round(
				this.container.client.ws.ping
			)}ms. Message Latency ${
				msg.createdTimestamp - message.createdTimestamp
			}ms.`
		)
	}
}
