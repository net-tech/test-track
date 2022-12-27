"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const boot_1 = __importDefault(require("../services/boot"));
const logger_1 = require("../services/logger");
module.exports = {
    name: "apiResponse",
    once: false,
    execute(request, response) {
        if (boot_1.default.environment() !== "development")
            return;
        logger_1.log.info(`${response.status} | API Response on ${response.url} after ${request.retries + 1} retries.`);
    }
};
