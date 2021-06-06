# Discord Plugin

A proof-of-concept plugin that provides very basic Discord integration.

## Getting started

Discord only lets "[self-bots](https://support.discord.com/hc/en-us/articles/115002192352-Automated-user-accounts-self-bots-)" control your local Discord client, meaning you have to create your own Discord Application in order to use this plugin.

1. Download the latest `com.midi-mixer.discord-x.y.z.midiMixerPlugin` file from the [releases](https://github.com/midi-mixer/plugin-discord/releases) page and double-click it to install the plugin
2. Go to the [Discord Developer Portal](https://discordapp.com/developers) and create an application
3. Go to "OAuth2" on the left hand side
4. Add `http://localhost/` as a redirect URI
5. Copy the "Client ID" in to the plugin's settings page in MIDI Mixer
6. Copy the "Client Secret" in to the plugin's settings page in MIDI Mixer
7. Activate the plugin
8. Click "Authorize" on the prompt that appears, allowing the plugin access to information like voice settings

If there's a problem, check the `Status` message on the plugin's settings page or run the plugin in dev mode to see what might be causing the issue.

Once all this is done, you should be able to see the below faders and buttons available in MIDI Mixer:

### Faders

- Input device
  - Controls your mic level
  - Mute button toggles mute
- Output device
  - Controls incoming audio volume levels
  - Mute button toggle deafen

### Buttons

- Toggle mute
- Toggle deafen
- Toggle automatic gain control
- Toggle echo cancellation
- Toggle noise reduction
- Toggle Quality of Service High Packet Priority
- Toggle silence warnings
- Toggle push-to-talk / voice activity `SOON™`
- Toggle automatic input sensitivity `SOON™`
