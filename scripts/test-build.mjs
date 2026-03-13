import { stat } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const REQUIRED_OUTPUTS = [
  "dist/.nojekyll",
  "dist/assets/css/index.css",
  "dist/assets/js/tailwind-config.js",
  "dist/chat/index.html",
  "dist/extensions/index.html",
  "dist/jobs/index.html",
  "dist/memory/index.html",
  "dist/routines/index.html",
  "dist/skills/index.html",
];

async function main() {
  for (const relativePath of REQUIRED_OUTPUTS) {
    const absolutePath = path.join(ROOT, relativePath);

    try {
      const fileStat = await stat(absolutePath);

      if (!fileStat.isFile()) {
        throw new Error("not a file");
      }
    } catch (error) {
      console.error(`Missing required build output: ${relativePath}`);
      process.exitCode = 1;
      return;
    }
  }

  console.log("Build smoke test passed.");
}

await main();
