import {spawn} from "node:child_process";
import {createRequire} from "node:module";

const resolve = createRequire(import.meta.url);
const preview = process.argv.includes("--production-preview");
const options = process.argv.slice(2)
  .filter(flag => flag !== "--strictPort" && flag !== "--production-preview")
  .map(flag => flag === "--host" ? "--hostname" : flag);
const child = spawn(process.execPath, [resolve.resolve("next/dist/bin/next"), preview ? "start" : "dev", ...options], {stdio: "inherit"});
for (const signal of ["SIGINT","SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("exit", code => process.exit(code ?? 1));
