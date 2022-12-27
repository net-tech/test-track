import { APIRequest } from "discord.js"
import boot from "../services/boot"
import { log } from "../services/logger"

module.exports = {
	name: "apiResponse",
	once: false,
	execute(request: APIRequest, response: Response) {
		if (boot.environment() !== "development") return

		log.info(
			`${response.status} | API Response on ${response.url} after ${request.retries + 1} retries.`
		)
	}
}