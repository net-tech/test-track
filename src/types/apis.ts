const BlacklistReasonKeys = {
	QR: "Fake QR code verification",
	AUTH: "Force join authentication",
	TOS: "TOS breaking guild",
	INVREWARDS: "Scam invite rewards",
	LINK: "Server links to another blacklisted server",
	SKID: "Server affiliated with skids"
}

type BlacklistReasonKey = keyof typeof BlacklistReasonKeys

interface BlacklistTarget {
	/**
	 * The guild to blacklist. Invite code or ID.
	 */
	guild: string
	/**
	 * The reason key for blacklisting the guild.
	 */
	reasonKey: BlacklistReasonKey
}

interface DangerousDiscordBadges {
	blacklisted?: boolean;
	whitelisted?: boolean;
	admin?: boolean;
	raid_bot?: boolean;
	scam_bot?: boolean;
}

interface BlacklistResponse {
	frisky: {
		blacklisted: boolean
		reason: string
	}
	blacklister: {
		blacklisted: boolean
		reason: string
		evidence: string
	}
	dangerousDiscord: {
		reports: number
		badges: DangerousDiscordBadges,
		votes: {
			upvotes: number
			downvotes: number
		}
		flags: {
			spammer: boolean
		},
	}
	dangerous: boolean
}

interface SecurityServiceCheckResponse {
	status: number,
	message: string,
}

const dangerousPermissions = [
	"Administrator",
	"Manage Server",
	"Manage Channels",
	"Manage Roles",
	"Manage Webhooks",
	"Manage Messages",
	"Mention Everyone",
	"Ban Members",
	"Kick Members",
	"Moderate Members"
]

export { BlacklistReasonKeys, BlacklistReasonKey, BlacklistTarget, DangerousDiscordBadges, BlacklistResponse, SecurityServiceCheckResponse, dangerousPermissions }