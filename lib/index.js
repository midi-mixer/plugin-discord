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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var discord_rpc_1 = __importDefault(require("discord-rpc"));
require("midi-mixer-plugin");
var api_1 = require("./api");
var midiMixerRpc = null;
var api = null;
var cleanUpConnections = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Promise.all([
                    new Promise(function (resolve) {
                        if (!midiMixerRpc)
                            return resolve();
                        midiMixerRpc.destroy().finally(function () {
                            midiMixerRpc = null;
                            resolve();
                        });
                    }),
                    new Promise(function (resolve) {
                        if (!api)
                            return resolve();
                        api.disconnect().finally(function () {
                            api = null;
                            resolve();
                        });
                    }),
                ])];
            case 1:
                _a.sent();
                $MM.setSettingsStatus("status", "Disconnected");
                return [2 /*return*/];
        }
    });
}); };
$MM.onClose(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, cleanUpConnections()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
var connectPresence = function () { return __awaiter(void 0, void 0, void 0, function () {
    var midiMixerClientId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                midiMixerClientId = "802892683936268328";
                midiMixerRpc = new discord_rpc_1.default.Client({
                    transport: "ipc",
                });
                return [4 /*yield*/, midiMixerRpc.connect(midiMixerClientId)];
            case 1:
                _a.sent();
                return [4 /*yield*/, midiMixerRpc.setActivity({
                        details: "Controlling volumes",
                        state: "Using MIDI",
                        largeImageKey: "logo",
                        largeImageText: "MIDI Mixer",
                        buttons: [
                            {
                                label: "Get MIDI Mixer",
                                url: "https://www.midi-mixer.com",
                            },
                        ],
                    })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var connect = function () { return __awaiter(void 0, void 0, void 0, function () {
    var settings, clientId, clientSecret, presence, showPresence, clientIdValid, clientSecretValid, rpc, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: 
            /**
             * Disconnect any running instances.
             */
            return [4 /*yield*/, cleanUpConnections()];
            case 1:
                /**
                 * Disconnect any running instances.
                 */
                _a.sent();
                $MM.setSettingsStatus("status", "Getting plugin settings...");
                return [4 /*yield*/, $MM.getSettings()];
            case 2:
                settings = _a.sent();
                clientId = settings.clientId;
                clientSecret = settings.clientSecret;
                presence = settings.presence;
                showPresence = !presence;
                if (showPresence)
                    connectPresence();
                clientIdValid = Boolean(clientId) && typeof clientId === "string";
                clientSecretValid = Boolean(clientSecret) && typeof clientSecret === "string";
                if (!clientIdValid || !clientSecretValid) {
                    return [2 /*return*/, void $MM.setSettingsStatus("status", "Error: No or incorrect Client ID or Client Secret.")];
                }
                rpc = new discord_rpc_1.default.Client({
                    transport: "ipc",
                });
                api = new api_1.DiscordApi(rpc, clientId, clientSecret);
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4 /*yield*/, api.bootstrap()];
            case 4:
                _a.sent();
                return [3 /*break*/, 6];
            case 5:
                err_1 = _a.sent();
                console.error(err_1);
                cleanUpConnections();
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
$MM.onSettingsButtonPress("reconnect", connect);
connect();
