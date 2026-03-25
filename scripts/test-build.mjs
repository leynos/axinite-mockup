import { stat } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const REQUIRED_OUTPUTS = [
  "dist/index.html",
  "dist/.nojekyll",
  "dist/chat/index.html",
  "dist/memory/index.html",
  "dist/jobs/index.html",
  "dist/routines/index.html",
  "dist/extensions/index.html",
  "dist/skills/index.html",
  "dist/manifest.webmanifest",
];

async function main() {
  for (const relativePath of REQUIRED_OUTPUTS) {
    const absolutePath = path.join(ROOT, relativePath);

    try {
      const fileStat = await stat(absolutePath);

      if (!fileStat.isFile()) {
        throw new Error("not a file");
      }
    } catch {
      console.error(`Missing required build output: ${relativePath}`);
      process.exitCode = 1;
      return;
    }
  }

  console.log("Build smoke test passed.");
}

await main();
