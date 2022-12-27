enum Color {
	Blue = "#007aff",
	Green = "#34c759",
	Red = "#ff3b30",
	Orange = "#ff9500",
	RedDark = "#ff453a",
	Yellow = "#ffcc00",
	Indigo = "#5856d6",
	Purple = "#af52de",
	Grey = "#48484a",
}

enum Regex {
	Domain = "(https?:\\/\\/)?(www\\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_+.~#?&//=]*)",
	Id = "([0-9]{17,20})",
	Ip = "((?:[0-9]{1,3}\\.){3}[0-9]{1,3})",
	// eslint-disable-next-line no-useless-escape
	Invite = "/((?:https?:\/\/)?discord(?:(?:app)?.com\/invite\/|.gg\/)[A-Za-z0-9]{2,})/gmi",
}

enum Icon {
	Cross = "https://media.discordapp.net/attachments/899028693328998470/994619228114141215/TwoToneStarClose.png",
	Check = "https://media.discordapp.net/attachments/899028693328998470/994619227866681364/TwoToneStarCheck.png",
}

export { Color, Regex, Icon }