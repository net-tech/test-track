import {
	ChatInputCommand,
	ContextMenuCommand,
	MessageCommand,
	Precondition
} from "@sapphire/framework"
import type {
	ChatInputCommandInteraction,
	ContextMenuCommandInteraction,
	Message
} from "discord.js"
import { GlobalKill } from "global-kill"

export class UserPrecondition extends Precondition {
	public override messageRun(_message: Message, command: MessageCommand) {
		return this.isEnabled(command.name)
	}

	public override chatInputRun(
		_interaction: ChatInputCommandInteraction,
		command: ChatInputCommand
	) {
		return this.isEnabled(command.name)
	}

	public override contextMenuRun(
		_interaction: ContextMenuCommandInteraction,
		command: ContextMenuCommand
	) {
		return this.isEnabled(command.name)
	}

	private isEnabled(commandName: string) {
		return GlobalKill.get(commandName)?.enabled
			? this.ok()
			: this.error({
					message:
						"This command or feature has been temporarily disabled. Please try again later."
			  })
	}
}

declare module "@sapphire/framework" {
	interface Preconditions {
		Enabled: never
	}
}
