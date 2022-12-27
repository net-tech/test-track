"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const antiphish_1 = __importDefault(require("../utilities/antiphish"));
const logger_1 = require("./logger");
const FISH_FISH_URL = "https://api.fishfish.gg/v1";
/**
 * Allows various methods of checking if a string is a phishing attempt.
 */
class AntiPhishService {
    /**
     *
     * @param url The URL or Domain to check.
     * @returns Whether or not the URL or Domain is a phishing attempt.
     */
    static async isPhishing(url) {
        if (antiphish_1.default.isDefangedURL(url)) {
            url = antiphish_1.default.convertDefangedURL(url);
        }
        const urlResult = await axios_1.default.get(`${FISH_FISH_URL}/urls/${url}`)
            .then((res) => {
            return res.data.category !== "safe";
        })
            .catch((err) => {
            if (err.response.status === 404)
                return false;
            logger_1.log.error(err, "Failed to check if domain is phishing attempt.", "AntiPhishService.isPhishing");
            return false;
        });
        const domainResult = await axios_1.default.get(`${FISH_FISH_URL}/domains/${url}`)
            .then((res) => {
            return res.data.category !== "safe";
        })
            .catch((err) => {
            if (err.response.status === 404)
                return false;
            logger_1.log.error(err, "Failed to check if domain is phishing attempt.", "AntiPhishService.isPhishing");
            return false;
        });
        return urlResult || domainResult;
    }
}
exports.default = AntiPhishService;
