import { RPClient, VoiceSettings } from "rpcord";
import { Assignment, ButtonType } from "midi-mixer-plugin";

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
  // OutputVolume = "outputVolume",
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

  private rpc: RPClient;
  private buttons: Record<DiscordButton, ButtonType> | null = null;
  private faders: Record<DiscordFader, Assignment> | null = null;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private settings?: VoiceSettings;

  constructor(rpc: RPClient) {
    this.rpc = rpc;
    this.bootstrap();
  }

  public async disconnect(): Promise<void> {
    this.rpc.disconnect();

    if (this.syncInterval) clearInterval(this.syncInterval);

    Object.values(this.buttons ?? {}).forEach((button) => void button.remove());
    Object.values(this.faders ?? {}).forEach((fader) => void fader.remove());
  }

  private async bootstrap() {
    await this.rpc.connect();
    await this.rpc.authorize(DiscordApi.scopes);

    this.settings = await this.rpc.getVoiceSettings();

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
          active: this.settings.automatic_gain_control,
        }
      ).on("pressed", async () => {
        if (!this.settings) return;

        const settings = await this.rpc.setVoiceSettings({
          automatic_gain_control: !this.settings.automatic_gain_control,
        });

        this.sync(settings);
      }),
    };

    this.faders = {
      [DiscordFader.InputVolume]: new Assignment(DiscordFader.InputVolume, {
        name: "Input volume",
        muted: this.settings.mute,
      }).on("mutePressed", async () => {
        if (!this.settings) return;

        const settings = await this.rpc.setVoiceSettings({
          mute: !this.settings.mute,
        });

        this.sync(settings);
      }),
    };

    this.syncInterval = setInterval(() => void this.sync(), DiscordApi.syncGap);
    this.sync();
  }

  private async sync(settings?: VoiceSettings) {
    this.settings = settings ?? (await this.rpc.getVoiceSettings());
    if (!this.buttons) return;

    this.buttons[
      DiscordButton.ToggleAutomaticGainControl
    ].active = this.settings.automatic_gain_control;
  }
}
