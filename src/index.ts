import RPC from "discord-rpc";
import "midi-mixer-plugin";
import { DiscordApi } from "./api";

let midiMixerRpc: RPC.Client | null = null;
let api: DiscordApi | null = null;

const cleanUpConnections = async () => {
  await Promise.all([
    new Promise<void>((resolve) => {
      if (!midiMixerRpc) return resolve();

      midiMixerRpc.destroy().finally(() => {
        midiMixerRpc = null;
        resolve();
      });
    }),
    new Promise<void>((resolve) => {
      if (!api) return resolve();

      api.disconnect().finally(() => {
        api = null;
        resolve();
      });
    }),
  ]);

  $MM.setSettingsStatus("status", "Disconnected");
};

$MM.onClose(async () => {
  await cleanUpConnections();
});

const connectPresence = async () => {
  const midiMixerClientId = "802892683936268328";

  midiMixerRpc = new RPC.Client({
    transport: "ipc",
  });

  await midiMixerRpc.connect(midiMixerClientId);

  await midiMixerRpc.setActivity({
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
  });
};

const connect = async () => {
  /**
   * Disconnect any running instances.
   */
  await cleanUpConnections();

  $MM.setSettingsStatus("status", "Getting plugin settings...");
  const settings = await $MM.getSettings();

  const clientId = settings.clientId as string;
  const clientSecret = settings.clientSecret as string;
  const presence = settings.presence as string;

  /**
   * A blank presence field means presence SHOULD HAPPEN.
   */
  const showPresence = !presence;
  if (showPresence) connectPresence();

  const clientIdValid = Boolean(clientId) && typeof clientId === "string";
  const clientSecretValid =
    Boolean(clientSecret) && typeof clientSecret === "string";

  if (!clientIdValid || !clientSecretValid) {
    return void $MM.setSettingsStatus(
      "status",
      "Error: No or incorrect Client ID or Client Secret."
    );
  }

  const rpc = new RPC.Client({
    transport: "ipc",
  });

  api = new DiscordApi(rpc, clientId, clientSecret);

  try {
    await api.bootstrap();
  } catch (err) {
    console.error(err);
    cleanUpConnections();
  }
};

$MM.onSettingsButtonPress("reconnect", connect);
connect();
