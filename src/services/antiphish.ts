import axios from "axios"
import AntiPhishUtil from "../utilities/antiphish"
import { log } from "./logger"

const FISH_FISH_URL ="https://api.fishfish.gg/v1"

/**
 * Allows various methods of checking if a string is a phishing attempt.
 */
class AntiPhishService {
	/**
	 * 
	 * @param url The URL or Domain to check.
	 * @returns Whether or not the URL or Domain is a phishing attempt.
	 */
	static async isPhishing(url: string): Promise<boolean> {
		if (AntiPhishUtil.isDefangedURL(url)) {
			url = AntiPhishUtil.convertDefangedURL(url)
		}

		const urlResult = await axios.get(`${FISH_FISH_URL}/urls/${url}`)
			.then((res) => {
				return res.data.category !== "safe"
			})
			.catch((err) => {
				if(err.response.status === 404) return false
				log.error(err, "Failed to check if domain is phishing attempt.", "AntiPhishService.isPhishing")
				return false
			})

		const domainResult = await axios.get(`${FISH_FISH_URL}/domains/${url}`)
			.then((res) => {
				return res.data.category !== "safe"
			})
			.catch((err) => {
				if(err.response.status === 404) return false
				log.error(err, "Failed to check if domain is phishing attempt.", "AntiPhishService.isPhishing")
				return false
			})

		return urlResult || domainResult
	}
}

export default AntiPhishService