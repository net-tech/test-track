"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Icon = exports.Regex = exports.Color = void 0;
var Color;
(function (Color) {
    Color["Blue"] = "#007aff";
    Color["Green"] = "#34c759";
    Color["Red"] = "#ff3b30";
    Color["Orange"] = "#ff9500";
    Color["RedDark"] = "#ff453a";
    Color["Yellow"] = "#ffcc00";
    Color["Indigo"] = "#5856d6";
    Color["Purple"] = "#af52de";
    Color["Grey"] = "#48484a";
})(Color || (Color = {}));
exports.Color = Color;
var Regex;
(function (Regex) {
    Regex["Domain"] = "(https?:\\/\\/)?(www\\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_+.~#?&//=]*)";
    Regex["Id"] = "([0-9]{17,20})";
    Regex["Ip"] = "((?:[0-9]{1,3}\\.){3}[0-9]{1,3})";
    // eslint-disable-next-line no-useless-escape
    Regex["Invite"] = "/((?:https?://)?discord(?:(?:app)?.com/invite/|.gg/)[A-Za-z0-9]{2,})/gmi";
})(Regex || (Regex = {}));
exports.Regex = Regex;
var Icon;
(function (Icon) {
    Icon["Cross"] = "https://media.discordapp.net/attachments/899028693328998470/994619228114141215/TwoToneStarClose.png";
    Icon["Check"] = "https://media.discordapp.net/attachments/899028693328998470/994619227866681364/TwoToneStarCheck.png";
})(Icon || (Icon = {}));
exports.Icon = Icon;
