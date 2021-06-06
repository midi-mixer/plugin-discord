import { renameSync } from "fs";
import { name, version } from "../plugin.json";

const baseName = [name, version].join("-");
const expectedName = `${baseName}.tgz`;
const targetName = `${baseName}.midiMixerPlugin`;

renameSync(expectedName, targetName);
