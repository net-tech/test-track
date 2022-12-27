import { APIRequest } from "discord.js"
import boot from "../services/boot"
import { log } from "../services/logger"

module.exports = {
	name: "apiRequest",
	once: false,
	execute(request: APIRequest) {
		if (boot.environment() !== "development") return

		log.info(
			`${request.method} | API Request on ${request.path}. Retry #${request.retries + 1 }.`
		)
	}
}