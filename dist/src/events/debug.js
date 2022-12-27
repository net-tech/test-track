"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const boot_1 = __importDefault(require("../services/boot"));
const logger_1 = require("../services/logger");
module.exports = {
    name: "debug",
    once: false,
    execute(info) {
        boot_1.default.environment() === "production" ? null : logger_1.log.debug(info);
    }
};
