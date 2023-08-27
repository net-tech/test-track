import { Command } from "@sapphire/framework"
import { codeBlock } from "@sapphire/utilities"
import { ApplicationCommandType } from "discord.js"

export class UserCommand extends Command {
	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: "Add Line Numbers"
		})
	}

	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerContextMenuCommand((builder) =>
			builder //
				.setName(this.name)
				.setType(ApplicationCommandType.Message)
		)
	}

	public override async contextMenuRun(
		interaction: Command.ContextMenuCommandInteraction
	) {
		const message = await interaction.channel.messages.fetch(
			interaction.targetId
		)

		if (!message)
			return interaction.reply({
				content: "Unable to fetch message.",
				ephemeral: true
			})

		const codeBlockPattern = /^```[a-z]*\n([\s\S]+?)\n```$/
		const result = codeBlockPattern.exec(message.content)

		const toFormat = result ? result[1] : message.content

		const lines = toFormat.split("\n")
		for (let i = 0; i < lines.length; i++) {
			lines[i] = `${i + 1} ${lines[i]}`
		}

		return interaction.reply({
			content: `${codeBlock("js", lines.join("\n"))}`,
			ephemeral: true
		})
	}
}
