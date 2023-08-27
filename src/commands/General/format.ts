import { Command } from '@sapphire/framework';
import { ApplicationCommandType } from 'discord.js';
import prettier from 'prettier';


export class UserCommand extends Command {
		public constructor(context: Command.Context) {
			super(context, {
				name: "Format",
				description: "Format code.",
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

			// match ```<language code> or ```
			const codeBlockRegex = /```(?:(?<lang>\S+)\n)?(?<code>[\s\S]+?)```/gmi
			const codeBlocks = message.content.matchAll(codeBlockRegex)

			if (!codeBlocks)
				return interaction.reply({
					content: "No code blocks found.",
					ephemeral: true
				})

			const formattedCodeBlocks = []

			for (const codeBlock of codeBlocks) {
				const { lang, code } = codeBlock.groups

				const formattedCode = await prettier.format(code, {
					parser: (lang === "js" || lang === "ts") ? "typescript" : lang,
					semi: false,
					singleQuote: false,
					useTabs: true,
					trailingComma: "none",
					proseWrap: "never",				
				})

				formattedCodeBlocks.push(
					`\`\`\`${lang ?? ''}\n${formattedCode}\`\`\``
				)
			}

			return interaction.reply({
				content: formattedCodeBlocks.join('\n'),
			})
		}
	}