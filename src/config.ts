import Conf from "conf";

export const config = new Conf({
  configName: "com.midi-mixer.discord",
});

export enum Keys {
  AuthToken = "authToken",
}
