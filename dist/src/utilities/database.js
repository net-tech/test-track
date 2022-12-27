"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const boot_1 = __importDefault(require("../services/boot"));
const logger_1 = require("../services/logger");
const prisma = boot_1.default.prisma();
class Database {
    /**
     * Creates a watched user in the database.
     * @param {User} user The user to create a watched user for.
     * @param {string} addedBy The user who added the watched user.
     * @param {string?} reason The reason for adding the watched user.
     * @returns {Promise<watchedUser | null>}
     * @error Returns null on error.
     */
    static async createWatchedUser(user, addedBy, reason) {
        try {
            return await prisma.watchedUser.create({
                data: {
                    userId: user.id,
                    addedAt: new Date(),
                    addedBy: addedBy,
                    lastCheckedAt: new Date(),
                    avatarURL: user.displayAvatarURL(),
                    username: user.username,
                    discriminator: user.discriminator,
                    flags: user.flags?.bitfield ?? 0,
                    reason: reason ?? null
                }
            });
        }
        catch (error) {
            logger_1.log.error(`Failed to create watched user ${user.tag} (${user.id}) in database: ${error}`);
            return null;
        }
    }
    /**
     * Deletes a watched user from the database.
     * @param {User} user The user to delete a watched user for.
     * @returns {Promise<boolean>} Whether the deletion was successful.
     * @error Returns false on error.
     */
    static async removeWatchedUser(user) {
        try {
            await prisma.watchedUser.delete({
                where: {
                    userId: user.id
                }
            });
            return true;
        }
        catch (error) {
            logger_1.log.error(`Failed to delete watched user ${user.tag} (${user.id}) from database: ${error}`);
            return false;
        }
    }
    /**
     * Updates a watched user in the database.
     * @param {User} user The user to update a watched user for.
     * @returns {Promise<boolean>} Whether the update was successful.
     */
    static async updateWatchedUser(user) {
        try {
            await prisma.watchedUser.update({
                where: {
                    userId: user.id
                },
                data: {
                    lastCheckedAt: new Date(),
                    avatarURL: user.displayAvatarURL(),
                    username: user.username,
                    discriminator: user.discriminator,
                    flags: user.flags?.bitfield ?? 0
                }
            });
            return true;
        }
        catch (error) {
            logger_1.log.error(`Failed to update watched user ${user.tag} (${user.id}) in database: ${error}`);
            return false;
        }
    }
    /**
     * Gets all watched users from the database.
     * @returns {Promise<watchedUser[]>} The watched users.
     * @error Returns an empty array on error.
     */
    static async getWatchedUsers() {
        try {
            return await prisma.watchedUser.findMany();
        }
        catch (error) {
            logger_1.log.error(`Failed to get watched users from database: ${error}`);
            return [];
        }
    }
}
exports.default = Database;
