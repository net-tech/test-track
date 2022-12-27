"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const weird_to_normal_chars_1 = require("weird-to-normal-chars");
const replace_special_characters_1 = __importDefault(require("replace-special-characters"));
const sanitizer_1 = __importDefault(require("@aero/sanitizer"));
class normalize {
    static async normalize(text) {
        const hoistRegex = [
            /^[^A-Za-z0-9 ]+/gim,
            // eslint-disable-next-line no-irregular-whitespace
            /(​| | | | | | | | |⠀|)/gi,
        ];
        text = (0, sanitizer_1.default)(text);
        text = (0, weird_to_normal_chars_1.weirdToNormalChars)(text);
        text = (0, replace_special_characters_1.default)(text);
        for (let i = 0; i < 5; i++) {
            text = text.replace(hoistRegex[0], "");
            text = text.replace(hoistRegex[1], "");
        }
        if (text == " " || text == "") {
            return normalize.randNameStr("Moderated Username ");
        }
        if (text.length > 32) {
            return text.substring(0, 32);
        }
        return text;
    }
    static async randNameStr(pretext = "") {
        return `${pretext}${(Math.random() + 1).toString(36).substring(7)}`;
    }
}
exports.default = normalize;
