"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordApi = void 0;
var midi_mixer_plugin_1 = require("midi-mixer-plugin");
var config_1 = require("./config");
var DiscordButton;
(function (DiscordButton) {
    DiscordButton["ToggleAutomaticGainControl"] = "toggleAutomaticGainControl";
    // ToggleEchoCancellation = "toggleEchoCancellation",
    // ToggleNoiseSuppression = "toggleNoiseSuppression",
    // ToggleQos = "toggleQos",
    // ToggleSilenceWarning = "toggleSilenceWarning",
    // ToggleDeafen = "toggleDeafen",
    // ToggleMute = "toggleMute",
    // TogglePushToTalk = "togglePushToTalk",
    // ToggleAutoThreshold = "toggleAutoThreshold",
})(DiscordButton || (DiscordButton = {}));
var DiscordFader;
(function (DiscordFader) {
    DiscordFader["InputVolume"] = "inputVolume";
    DiscordFader["OutputVolume"] = "outputVolume";
    // VoiceActivityThreshold = "voiceActivityThreshold",
})(DiscordFader || (DiscordFader = {}));
var DiscordApi = /** @class */ (function () {
    function DiscordApi(rpc, clientId, clientSecret) {
        this.buttons = null;
        this.faders = null;
        this.syncInterval = null;
        this.rpc = rpc;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }
    DiscordApi.prototype.disconnect = function () {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.rpc.destroy()];
                    case 1:
                        _c.sent();
                        if (this.syncInterval)
                            clearInterval(this.syncInterval);
                        Object.values((_a = this.buttons) !== null && _a !== void 0 ? _a : {}).forEach(function (button) { return void button.remove(); });
                        Object.values((_b = this.faders) !== null && _b !== void 0 ? _b : {}).forEach(function (fader) { return void fader.remove(); });
                        return [2 /*return*/];
                }
            });
        });
    };
    DiscordApi.prototype.bootstrap = function () {
        return __awaiter(this, void 0, void 0, function () {
            var authToken, err_1, err_2, isAuthed, err_3, _a;
            var _b, _c;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        $MM.setSettingsStatus("status", "Connecting to Discord...");
                        authToken = "";
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, Promise.all([
                                new Promise(function (resolve, reject) {
                                    try {
                                        resolve(config_1.config.get(config_1.Keys.AuthToken));
                                    }
                                    catch (err) {
                                        reject(err);
                                    }
                                }),
                                this.rpc.connect(this.clientId),
                            ])];
                    case 2:
                        authToken = (_d.sent())[0];
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _d.sent();
                        console.error(err_1);
                        $MM.setSettingsStatus("status", "Disconnected; couldn't find Discord running");
                        throw err_1;
                    case 4:
                        if (!(authToken && typeof authToken === "string")) return [3 /*break*/, 8];
                        $MM.setSettingsStatus("status", "Logging in with existing credentials...");
                        _d.label = 5;
                    case 5:
                        _d.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this.rpc.login({
                                clientId: this.clientId,
                                accessToken: authToken,
                                scopes: DiscordApi.scopes,
                            })];
                    case 6:
                        _d.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        err_2 = _d.sent();
                        console.warn("Failed to authorise using existing token; stripping from config");
                        config_1.config.delete(config_1.Keys.AuthToken);
                        return [3 /*break*/, 8];
                    case 8:
                        isAuthed = Boolean(this.rpc.application);
                        if (!!isAuthed) return [3 /*break*/, 12];
                        _d.label = 9;
                    case 9:
                        _d.trys.push([9, 11, , 12]);
                        return [4 /*yield*/, this.authorize()];
                    case 10:
                        _d.sent();
                        return [3 /*break*/, 12];
                    case 11:
                        err_3 = _d.sent();
                        console.error(err_3);
                        return [2 /*return*/, $MM.setSettingsStatus("status", "User declined authorisation; cannot continue.")];
                    case 12:
                        this.rpc.subscribe("VOICE_SETTINGS_UPDATE", function (data) {
                            _this.sync(data);
                        });
                        $MM.setSettingsStatus("status", "Syncing voice settings...");
                        _a = this;
                        return [4 /*yield*/, this.rpc.getVoiceSettings()];
                    case 13:
                        _a.settings = _d.sent();
                        $MM.setSettingsStatus("status", "Connected");
                        this.buttons = (_b = {},
                            // [DiscordButton.ToggleAutoThreshold]: new ButtonType(
                            //   DiscordButton.ToggleAutoThreshold,
                            //   {
                            //     name: "Toggle auto threshold",
                            //     active: this.settings.mode.auto_threshold,
                            //   }
                            // ).on("pressed", async () => {
                            //   if (!this.settings) return;
                            //   await this.rpc.setVoiceSettings({
                            //     mode: {
                            //       ...this.settings.mode,
                            //       auto_threshold: !this.settings?.mode?.auto_threshold,
                            //     },
                            //   });
                            // }),
                            _b[DiscordButton.ToggleAutomaticGainControl] = new midi_mixer_plugin_1.ButtonType(DiscordButton.ToggleAutomaticGainControl, {
                                name: "Toggle automatic gain control",
                                active: this.settings.automaticGainControl,
                            }).on("pressed", function () { return __awaiter(_this, void 0, void 0, function () {
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, this.rpc.setVoiceSettings({
                                                automaticGainControl: !((_a = this.settings) === null || _a === void 0 ? void 0 : _a.automaticGainControl),
                                            })];
                                        case 1:
                                            _b.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }),
                            _b);
                        this.faders = (_c = {},
                            _c[DiscordFader.InputVolume] = new midi_mixer_plugin_1.Assignment(DiscordFader.InputVolume, {
                                name: "Input volume",
                                muted: this.settings.mute,
                                throttle: 150,
                            })
                                .on("mutePressed", function () { return __awaiter(_this, void 0, void 0, function () {
                                var currentState, muted, args;
                                var _a, _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            currentState = Boolean(((_a = this.settings) === null || _a === void 0 ? void 0 : _a.mute) || ((_b = this.settings) === null || _b === void 0 ? void 0 : _b.deaf));
                                            muted = !currentState;
                                            args = {
                                                mute: muted,
                                            };
                                            if (!muted)
                                                args.deaf = muted;
                                            return [4 /*yield*/, this.rpc.setVoiceSettings(args)];
                                        case 1:
                                            _c.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })
                                .on("volumeChanged", function (level) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!this.faders)
                                                return [2 /*return*/];
                                            this.faders[DiscordFader.InputVolume].volume = level;
                                            return [4 /*yield*/, this.rpc.setVoiceSettings({
                                                    input: {
                                                        volume: level * 100,
                                                    },
                                                })];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }),
                            _c[DiscordFader.OutputVolume] = new midi_mixer_plugin_1.Assignment(DiscordFader.OutputVolume, {
                                name: "Output volume",
                                muted: this.settings.deaf,
                                throttle: 150,
                            })
                                .on("mutePressed", function () { return __awaiter(_this, void 0, void 0, function () {
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0: return [4 /*yield*/, this.rpc.setVoiceSettings({
                                                deaf: !((_a = this.settings) === null || _a === void 0 ? void 0 : _a.deaf),
                                            })];
                                        case 1:
                                            _b.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })
                                .on("volumeChanged", function (level) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!this.faders)
                                                return [2 /*return*/];
                                            this.faders[DiscordFader.OutputVolume].volume = level;
                                            return [4 /*yield*/, this.rpc.setVoiceSettings({
                                                    output: {
                                                        volume: level * 200,
                                                    },
                                                })];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }),
                            _c);
                        this.syncInterval = setInterval(function () { return void _this.sync(); }, DiscordApi.syncGap);
                        this.sync();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Authorize with Discord, providing scopes and requesting an access token for
     * future use.
     */
    DiscordApi.prototype.authorize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var accessToken;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        $MM.setSettingsStatus("status", "Waiting for user authorisation...");
                        return [4 /*yield*/, this.rpc.login({
                                clientId: this.clientId,
                                clientSecret: this.clientSecret,
                                scopes: DiscordApi.scopes,
                                redirectUri: "http://localhost/",
                            })];
                    case 1:
                        _a.sent();
                        accessToken = this.rpc.accessToken;
                        if (!accessToken)
                            throw new Error("Logged in, but not access token available");
                        config_1.config.set(config_1.Keys.AuthToken, accessToken);
                        return [2 /*return*/];
                }
            });
        });
    };
    DiscordApi.prototype.sync = function (settings) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this;
                        if (!(settings !== null && settings !== void 0)) return [3 /*break*/, 1];
                        _b = settings;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.rpc.getVoiceSettings()];
                    case 2:
                        _b = (_c.sent());
                        _c.label = 3;
                    case 3:
                        _a.settings = _b;
                        if (this.buttons) {
                            this.buttons[DiscordButton.ToggleAutomaticGainControl].active = this.settings.automaticGainControl;
                        }
                        if (this.faders) {
                            this.faders[DiscordFader.InputVolume].muted =
                                this.settings.mute || this.settings.deaf;
                            this.faders[DiscordFader.OutputVolume].muted = this.settings.deaf;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    DiscordApi.scopes = [
        "rpc",
        "rpc.activities.write",
        "rpc.voice.read",
        "rpc.voice.write",
    ];
    DiscordApi.syncGap = 1000 * 30;
    return DiscordApi;
}());
exports.DiscordApi = DiscordApi;
