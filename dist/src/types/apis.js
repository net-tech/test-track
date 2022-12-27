"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dangerousPermissions = exports.BlacklistReasonKeys = void 0;
const BlacklistReasonKeys = {
    QR: "Fake QR code verification",
    AUTH: "Force join authentication",
    TOS: "TOS breaking guild",
    INVREWARDS: "Scam invite rewards",
    LINK: "Server links to another blacklisted server",
    SKID: "Server affiliated with skids"
};
exports.BlacklistReasonKeys = BlacklistReasonKeys;
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
];
exports.dangerousPermissions = dangerousPermissions;
