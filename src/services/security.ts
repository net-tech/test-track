import { User } from "discord.js"
import { log } from "./logger"
import { SecurityServiceCheckResponse } from "../types/apis"

class Security {
	/**
	 * Checks if a eval is allowed to execute.
	 * @param code The code to check
	 * @param user The user who is executing the code
	 * @returns {Promise<SecurityServiceCheckResponse>} The response
	 */
	public static async evalCheck(code: string, user: User): Promise<SecurityServiceCheckResponse> {
		const disallowed = [
			"secret",
			"token",
			"process.env",
			"SECRET",
			"TOKEN",
			"PROCESS.ENV",
			"client.token",
			"CLIENT.TOKEN",
			"require('child_process');",
			"MONGO_URI",
		]
		if (!(await Security.isEvalerUser(user))) {
			return {
				status: 0,
				message: "Unauthorized user",
			}
		}

		if (
			disallowed.some((disallowedSnippet) =>
				code.includes(disallowedSnippet)
			)
		) {
			log.warn(
				code,
				`The code provided by ${user.tag} (${user.id}) is not allowed to be eval - dangerous code`
			)
			return {
				status: 0,
				message: "Dangerous evaluation input",
			}
		}

		return {
			status: 1,
			message: "Authorized and authenticated",
		}
	}

	public static async execCheck(code: string, user: User): Promise<SecurityServiceCheckResponse> {
		
		const disallowed = [
			"secret",
			"token",
			"process.env",
			"SECRET",
			"TOKEN",
			"PROCESS.ENV",
			"client.token",
			"CLIENT.TOKEN",
			"require('child_process');",
			"MONGO_URI",
			".env",
			"rm",
			"rm -rf",
			":(){:|:&};:",
			"/dev/sda",
			"mv /home/user/* /dev/null",
			"mkfs.ext3 /dev/sda",
			"dd if=/dev/random of=/dev/sda",
			"sudo apt purge python2.x-minimal",
			"chmod -R 777 /",
		]
		if (!(await Security.isEvalerUser(user))) {
			return {
				status: 0,
				message: "Unauthorized user",
			}
		}
		if (
			disallowed.some((disallowedSnippet) =>
				code.includes(disallowedSnippet)
			)
		) {
			log.warn(
				code,
				`The code provided by ${user.tag} (${user.id}) is not allowed to be executed - dangerous code`
			)
			return {
				status: 0,
				message: "Dangerous execution input",
			}
		}

		return {
			status: 1,
			message: "Authorized and authenticated",
		}
	}

	/**
	 * Preforms a basic check to see if the user is the bot owner.
	 * @param {string} user The user to check
	 * @returns {Promise<SecurityServiceCheckResponse>} The response
	 */
	public static async isEvalerUser(user: User): Promise<SecurityServiceCheckResponse> {
		if (user.id === process.env.OWNER_ID) {
			return {
				status: 1,
				message: "Authorized and authenticated",
			}
		} else {
			return {
				status: 0,
				message: "Unauthorized user",
			}
		}
	}
}

export default Security