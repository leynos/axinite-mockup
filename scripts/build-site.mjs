import { cp, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE_SOURCE_DIR = path.join(process.cwd(), "axinite");
const DIST_DIR = path.join(process.cwd(), "dist");

async function main() {
  await rm(DIST_DIR, { force: true, recursive: true });
  await cp(SITE_SOURCE_DIR, DIST_DIR, { recursive: true });
  await writeFile(path.join(DIST_DIR, ".nojekyll"), "");
  console.log("Built static Axinite mockup into dist/.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
