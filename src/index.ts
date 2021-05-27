import { Presence, RPClient } from "rpcord";
import "midi-mixer-plugin";
import { DiscordApi } from "./api";

let midiMixerRpc: RPClient | null = null;
let api: DiscordApi | null = null;

const cleanUpConnections = () => {
  if (midiMixerRpc) {
    midiMixerRpc.disconnect();
    midiMixerRpc = null;
  }

  if (api) {
    api.disconnect();
    api = null;
  }
};

const connectPresence = async () => {
  const midiMixerClientId = "802892683936268328";

  midiMixerRpc = new RPClient(midiMixerClientId);
  await midiMixerRpc.connect();

  await midiMixerRpc.setActivity(
    new Presence()
      .setDetails("Controlling volumes")
      .setState("Using MIDI")
      .setLargeImage("logo")
      .setLargeText("MIDI Mixer")
      .setStartTimestamp(Date.now())
      .addButton({
        label: "Get MIDI Mixer",
        url: "https://www.midi-mixer.com",
      })
  );
};

const connect = async () => {
  /**
   * Disconnect any running instances.
   */
  cleanUpConnections();

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

  const scopes = [
    "rpc",
    "rpc.activities.write",
    "rpc.voice.read",
    "rpc.voice.write",
  ];

  const rpc = new RPClient(clientId, {
    secret: clientSecret,
    scopes,
  });

  api = new DiscordApi(rpc);
};

$MM.onSettingsButtonPress("reconnect", connect);
connect();
