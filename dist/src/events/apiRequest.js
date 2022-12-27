"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const boot_1 = __importDefault(require("../services/boot"));
const logger_1 = require("../services/logger");
module.exports = {
    name: "apiRequest",
    once: false,
    execute(request) {
        if (boot_1.default.environment() !== "development")
            return;
        logger_1.log.info(`${request.method} | API Request on ${request.path}. Retry #${request.retries + 1}.`);
    }
};
