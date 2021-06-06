import { writeFileSync } from "fs";
import manifest from "../plugin.json";

const [version] = process.argv.slice(-1);

writeFileSync("plugin.json", JSON.stringify({ ...manifest, version }, null, 2));
