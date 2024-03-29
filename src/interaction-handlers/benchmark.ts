import {
	InteractionHandler,
	InteractionHandlerTypes
} from "@sapphire/framework"
import Benchmark, { Event } from "benchmark"
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ModalSubmitInteraction,
	RepliableInteraction
} from "discord.js"
import { nanoid } from "nanoid"

export class ModalHandler extends InteractionHandler {
	public constructor(ctx, options) {
		super(ctx, {
			...options,
			interactionHandlerType: InteractionHandlerTypes.ModalSubmit
		})
	}

	public override parse(interaction: ModalSubmitInteraction) {
		if (interaction.customId !== "benchmark") return this.none()

		return this.some()
	}

	public async run(interaction: ModalSubmitInteraction) {
		const benchId = nanoid()

		const controlRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setCustomId("cancel")
				.setLabel("Cancel")
				.setStyle(ButtonStyle.Danger)
		)

		const iterations = interaction.fields.getTextInputValue("iterations")
		const case1 = interaction.fields.getTextInputValue("case-1")
		const case2 = interaction.fields.getTextInputValue("case-2")

		// If we cannot parse a number, we cancel.
		if (Number.isNaN(Number(iterations)))
			return interaction.reply({
				content:
					"Unable to parse number of iterations. Please provide a valid number."
			})

		// If the code is empty, we cancel the benchmark.
		if (!(case1 && case2))
			return interaction.reply({
				content: "Please provide code for both test cases."
			})

		let content = `**Benchmark \`${benchId}\` with ${iterations} iterations**\n`

		await this.updateMessage(interaction, "", content, true, [controlRow])

		const benchSuite = new Benchmark.Suite(benchId, {
			onStart: async () => {
				await this.updateMessage(interaction, content, "Started", true)
			},
			onAbort: async () => {
				await this.updateMessage(
					interaction,
					content,
					"Cancelled",
					true,
					[],
					true
				)
			},
			onError: async () => {
				await this.updateMessage(interaction, content, "Error", true, [], true)
			},
			onComplete: async (event: Event) => {
				const benchmarkOpsSec = (event.currentTarget as Benchmark.Suite).map(
					(bench: Benchmark) => bench.hz
				)
				for (let i = 0; i < benchmarkOpsSec.length; i++) {
					const bench = (event.currentTarget as Benchmark.Suite)[i]
					content += `\n${
						bench.name
					}: ${bench.hz.toLocaleString()} ops/sec \u00B1${bench.stats.rme.toFixed(
						2
					)}% (${bench.stats.sample.length} runs sampled)`
				}
				const fastest = Math.max(...benchmarkOpsSec)
				const fastestName = (event.currentTarget as Benchmark.Suite)
					.filter((bench: Benchmark) => bench.hz === fastest)
					.map((bench: Benchmark) => bench.name)[0]
				content += `\n\n**${fastestName} is the fastest.**`
				await this.updateMessage(interaction, content, "Completed", true, [])
			}
		})

		benchSuite.add("Case 1", case1)
		benchSuite.add("Case 2", case2)

		benchSuite.run({ async: true, minSamples: Number(iterations) })
	} // TODO use https://www.npmjs.com/package/tinybench
	private async updateMessage(
		interaction: RepliableInteraction,
		currentContent: string,
		newContent: string,
		showTimestamp = true,
		components?: ActionRowBuilder<ButtonBuilder>[],
		newline = false
	) {
		const timestamp = showTimestamp
			? `<t:${Math.floor(Date.now() / 1000)}:t>`
			: ""

		// biome-ignore lint/style/noParameterAssign: function is small and reassignment is not confusing
		currentContent += `\n${newline ? "\n" : ""}\n${timestamp}: ${newContent}`
		interaction.replied || interaction.deferred
			? await interaction.editReply({
					content: currentContent,
					components
			  })
			: await interaction.reply({
					content: currentContent,
					components
			  })
	}
}
