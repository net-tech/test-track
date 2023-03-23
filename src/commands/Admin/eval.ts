// rome-ignore lint/correctness/noUnusedVariables: this is used in the @ApplyOptions<Command.Options> decorator
import { ApplyOptions } from "@sapphire/decorators"
import { Args, Command } from "@sapphire/framework"
import { isThenable } from "@sapphire/utilities"
import { codeBlock, Message } from "discord.js"
import { send } from "@sapphire/plugin-editable-commands"
import { Type } from "@sapphire/type"
import { inspect } from "util"
import { Stopwatch } from "@sapphire/stopwatch"

@ApplyOptions<Command.Options>({
	name: 'eval',
	aliases: ['ev'],
	description: 'Evaluates arbitrary Javascript.',
	quotes: [],
	preconditions: ['OwnerOnly', 'Enabled'],
	flags: ['async', 'hidden', 'showHidden', 'silent', 's'],
	options: ['depth']
})
export class UserCommand extends Command {
	public async messageRun(message: Message, args: Args) {
		const code = await args.rest("string")

		const { result, success, type, time } = await this.eval(message, code, {
			async: args.getFlags("async"), // --async Whether to run the code asynchronously
			depth: Number(args.getOption("depth")) ?? 0, // --depth=number The depth to inspect the result
			showHidden: args.getFlags("hidden", "showHidden") // --hidden Whether to show non-enumerable properties
		})

		const output = success
			? codeBlock("js", result)
			: `**ERROR**: ${codeBlock("bash", result)}`
		if (args.getFlags("silent", "s")) return null // --silent Whether to not send the output to the channel

		const timeFooter = `**Time**: \`${time.toString()}\``
		const typeFooter = `**Type**: \`${type}\``

		if (output.length > 2000) {
			return send(message, {
				content: `Output was too long... sent the result as a file.\n\n${timeFooter}\n${typeFooter}`,
				files: [{ attachment: Buffer.from(result), name: "output.js" }]
			})
		}

		return send(message, `${output}\n${timeFooter}\n${typeFooter}`)
	}

	protected async eval(
		message: Message,
		code: string,
		flags: { async: boolean; depth: number; showHidden: boolean }
	) {
		if (flags.async) code = `(async () => {\n${code}\n})();`

		// @ts-expect-error 6133
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const _msg = message

		let success = true
		let result = null
		const time = new Stopwatch()
		try {
			// deepcode ignore MissingArgument: there is no missing argument?
			result = eval(code)
		} catch (error) {
			if (error && error instanceof Error && error.stack) {
				this.container.client.logger.error(error)
			}
			result = error
			success = false
		}
		time.stop()

		const type = new Type(result).toString()
		if (isThenable(result)) result = await result

		if (typeof result !== "string") {
			result = inspect(result, {
				depth: flags.depth,
				showHidden: flags.showHidden
			})
		}

		if (process.env.DISCORD_TOKEN) {
			result.replaceAll(process.env.DISCORD_TOKEN, "[TOKEN]")
		}

		return { result, success, type, time }
	}
}
