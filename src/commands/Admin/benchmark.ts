import { Command } from "@sapphire/framework"
import {
	ActionRowBuilder,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle
} from "discord.js"

export class UserCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			...options,
			description: "Benchmark code directly in Discord.",
			aliases: ["bench"],
			preconditions: ["OwnerOnly"]
		})
	}

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
					.setPlaceholder("The number of iterations to run")
					.setValue("1000")
					.setRequired(true)
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
