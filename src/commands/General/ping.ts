import { Command } from "@sapphire/framework"
import { send } from "@sapphire/plugin-editable-commands"
import type { Message } from "discord.js"

export class UserCommand extends Command {
		public constructor(context: Command.Context, options: Command.Options) {
			super(context, {
				...options,
				description: "ping pong"
			})
		}

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
