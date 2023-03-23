// rome-ignore lint/correctness/noUnusedVariables: <explanation>
import { ApplyOptions } from "@sapphire/decorators"
import { Command } from "@sapphire/framework"
import {
	ActionRowBuilder,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle
} from "discord.js"

@ApplyOptions<Command.Options>({
	description: 'Benchmark code directly in Discord.',
	preconditions: ['OwnerOnly', 'Enabled']
})
export class UserCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
		)
	}

	public override async chatInputRun(
		interaction: Command.ChatInputCommandInteraction
	) {
		const iterations =
			new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId("iterations")
					.setLabel("Iterations")
					.setPlaceholder("Number of iterations. Default: 1000")
					.setRequired(false)
					.setStyle(TextInputStyle.Short)
			)
		const case1 =
			new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId("case-1")
					.setLabel("Code case 1")
					.setPlaceholder("The first code case")
					.setRequired(true)
					.setStyle(TextInputStyle.Paragraph)
			)
		const case2 =
			new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
				new TextInputBuilder()
					.setCustomId("case-2")
					.setLabel("Code case 2")
					.setPlaceholder("The second code case")
					.setRequired(true)
					.setStyle(TextInputStyle.Paragraph)
			)

		const modal = new ModalBuilder()
			.setTitle("Benchmark")
			.setCustomId("benchmark")
			.addComponents(iterations, case1, case2)

		await interaction.showModal(modal)
	}
}
