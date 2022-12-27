/**
 * Anti-phishing utilities
 */
class AntiPhishUtil {
	/**
	 * Defangs a URL.
	 * @param {string} url The URL to defang.
	 * @returns {string} The defanged URL.
	*/
	static defangURL(url: string, dots = true, http = true, slashes = true): string {
		if (dots) url = url.replace(".", "[.]")
		if (http) url = url.replace("http", "hxxp")
		if (slashes) url = url.replace("//", "[://]")

		return url
	}

	/**
	 * Converts a defanged URL to a normal URL.
	 * @param {string} url The defanged URL to convert.
	 * @returns {string} The converted URL.
	 * @see {@link defangURL}
	 */
	static convertDefangedURL(url: string): string {
		url = url.replace(/\[\.]/g, ".")
		url = url.replace(/hxxp/gi, "http")
		url = url.replace(/\[:\/\/]/g, "://")

		return url
	}

	/**
	 * Checks if a url is defanged.
	 * @param {string} url The URL to check.
	 * @returns {boolean} Whether or not the URL is defanged.
	 * @see {@link defangURL}
	 * @see {@link convertDefangedURL}
	 */
	static isDefangedURL(url: string): boolean {
		return url.includes("[.]") || url.includes("hxxp") || url.includes("[://]")
	}
}

export default AntiPhishUtil