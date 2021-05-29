"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Keys = exports.config = void 0;
var conf_1 = __importDefault(require("conf"));
exports.config = new conf_1.default({
    configName: "com.midi-mixer.discord",
});
var Keys;
(function (Keys) {
    Keys["AuthToken"] = "authToken";
})(Keys = exports.Keys || (exports.Keys = {}));
