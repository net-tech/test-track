import { AllFlowsPrecondition } from "@sapphire/framework"
import type {
	ChatInputCommandInteraction,
	ContextMenuCommandInteraction,
	Message
} from "discord.js"

export class OwnerOnlyPrecondition extends AllFlowsPrecondition {
	public override async messageRun(message: Message) {
		return this.checkOwner(message.author.id)
	}

	public override async chatInputRun(interaction: ChatInputCommandInteraction) {
		return this.checkOwner(interaction.user.id)
	}

	public override async contextMenuRun(
		interaction: ContextMenuCommandInteraction
	) {
		return this.checkOwner(interaction.user.id)
	}

	private checkOwner(userId: string) {
		const ownerIds =
			process.env.OWNER_IDS?.split(",").map((id) => id.trim()) ?? []
		return ownerIds?.includes(userId)
			? this.ok()
			: this.error({
					message: "You are not the bot owner.",
					context: {
						silent: true
					}
			  })
	}
}

declare module "@sapphire/framework" {
	interface Preconditions {
		OwnerOnly: never
	}
}
