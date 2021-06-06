import RPC, { VoiceSettings } from "discord-rpc";
import { Assignment, ButtonType } from "midi-mixer-plugin";
import { config, Keys } from "./config";

enum DiscordButton {
  ToggleAutomaticGainControl = "toggleAutomaticGainControl",
  // ToggleEchoCancellation = "toggleEchoCancellation",
  // ToggleNoiseSuppression = "toggleNoiseSuppression",
  // ToggleQos = "toggleQos",
  // ToggleSilenceWarning = "toggleSilenceWarning",
  // ToggleDeafen = "toggleDeafen",
  // ToggleMute = "toggleMute",
  // TogglePushToTalk = "togglePushToTalk",
  // ToggleAutoThreshold = "toggleAutoThreshold",
}

enum DiscordFader {
  InputVolume = "inputVolume",
  OutputVolume = "outputVolume",
  // VoiceActivityThreshold = "voiceActivityThreshold",
}

export class DiscordApi {
  private static scopes = [
    "rpc",
    "rpc.activities.write",
    "rpc.voice.read",
    "rpc.voice.write",
  ];
  private static syncGap = 1000 * 30;

  private rpc: RPC.Client;
  private clientId: string;
  private clientSecret: string;
  private buttons: Record<DiscordButton, ButtonType> | null = null;
  private faders: Record<DiscordFader, Assignment> | null = null;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private settings?: RPC.VoiceSettings;

  constructor(rpc: RPC.Client, clientId: string, clientSecret: string) {
    this.rpc = rpc;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  public async disconnect(): Promise<void> {
    await this.rpc.destroy();

    if (this.syncInterval) clearInterval(this.syncInterval);

    Object.values(this.buttons ?? {}).forEach((button) => void button.remove());
    Object.values(this.faders ?? {}).forEach((fader) => void fader.remove());
  }

  public async bootstrap(): Promise<void> {
    $MM.setSettingsStatus("status", "Connecting to Discord...");

    let authToken = "";

    try {
      [authToken] = await Promise.all([
        new Promise<string>((resolve, reject) => {
          try {
            resolve(config.get(Keys.AuthToken) as string);
          } catch (err) {
            reject(err);
          }
        }),
        this.rpc.connect(this.clientId),
      ]);
    } catch (err) {
      console.error(err);

      $MM.setSettingsStatus(
        "status",
        "Disconnected; couldn't find Discord running"
      );

      throw err;
    }

    if (authToken && typeof authToken === "string") {
      $MM.setSettingsStatus(
        "status",
        "Logging in with existing credentials..."
      );

      try {
        await this.rpc.login({
          clientId: this.clientId,
          accessToken: authToken,
          scopes: DiscordApi.scopes,
        });
      } catch (err) {
        console.warn(
          "Failed to authorise using existing token; stripping from config"
        );

        config.delete(Keys.AuthToken);
      }
    }

    const isAuthed = Boolean(this.rpc.application);

    if (!isAuthed) {
      try {
        await this.authorize();
      } catch (err) {
        console.error(err);

        return $MM.setSettingsStatus(
          "status",
          "User declined authorisation; cannot continue."
        );
      }
    }

    this.rpc.subscribe("VOICE_SETTINGS_UPDATE", (data: VoiceSettings) => {
      this.sync(data);
    });

    $MM.setSettingsStatus("status", "Syncing voice settings...");
    this.settings = await this.rpc.getVoiceSettings();
    $MM.setSettingsStatus("status", "Connected");

    this.buttons = {
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
      [DiscordButton.ToggleAutomaticGainControl]: new ButtonType(
        DiscordButton.ToggleAutomaticGainControl,
        {
          name: "Toggle automatic gain control",
          active: this.settings.automaticGainControl,
        }
      ).on("pressed", async () => {
        await (this.rpc as any).setVoiceSettings({
          automaticGainControl: !this.settings?.automaticGainControl,
        });
      }),
    };

    this.faders = {
      [DiscordFader.InputVolume]: new Assignment(DiscordFader.InputVolume, {
        name: "Input device",
        muted: this.settings.mute,
        throttle: 150,
      })
        .on("mutePressed", async () => {
          const currentState = Boolean(
            this.settings?.mute || this.settings?.deaf
          );
          const muted = !currentState;

          /**
           * If we're unmuting our mic, make sure to undeafen too.
           */
          const args: Partial<VoiceSettings> = {
            mute: muted,
          };

          if (!muted) args.deaf = muted;

          await (this.rpc as any).setVoiceSettings(args);
        })
        .on("volumeChanged", async (level: number) => {
          if (!this.faders) return;

          this.faders[DiscordFader.InputVolume].volume = level;

          await (this.rpc as any).setVoiceSettings({
            input: {
              volume: level * 100,
            },
          });
        }),
      [DiscordFader.OutputVolume]: new Assignment(DiscordFader.OutputVolume, {
        name: "Output device",
        muted: this.settings.deaf,
        throttle: 150,
      })
        .on("mutePressed", async () => {
          await (this.rpc as any).setVoiceSettings({
            deaf: !this.settings?.deaf,
          });
        })
        .on("volumeChanged", async (level: number) => {
          if (!this.faders) return;

          this.faders[DiscordFader.OutputVolume].volume = level;

          await (this.rpc as any).setVoiceSettings({
            output: {
              volume: level * 200,
            },
          });
        }),
    };

    this.syncInterval = setInterval(() => void this.sync(), DiscordApi.syncGap);
    this.sync();
  }

  /**
   * Authorize with Discord, providing scopes and requesting an access token for
   * future use.
   */
  private async authorize() {
    $MM.setSettingsStatus("status", "Waiting for user authorisation...");

    await this.rpc.login({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      scopes: DiscordApi.scopes,
      redirectUri: "http://localhost/",
    } as any);

    const accessToken = (this.rpc as any).accessToken;

    if (!accessToken)
      throw new Error("Logged in, but not access token available");

    config.set(Keys.AuthToken, accessToken);
  }

  private async sync(settings?: VoiceSettings) {
    this.settings = settings ?? (await this.rpc.getVoiceSettings());

    if (this.buttons) {
      this.buttons[
        DiscordButton.ToggleAutomaticGainControl
      ].active = this.settings.automaticGainControl;
    }

    if (this.faders) {
      this.faders[DiscordFader.InputVolume].muted =
        this.settings.mute || this.settings.deaf;
      this.faders[DiscordFader.OutputVolume].muted = this.settings.deaf;
    }
  }
}
