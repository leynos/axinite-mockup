import { cp, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DIST_DIR = path.join(process.cwd(), "dist");
const ROUTES = ["chat", "memory", "jobs", "routines", "extensions", "skills"];

async function main() {
  const indexPath = path.join(DIST_DIR, "index.html");
  await writeFile(path.join(DIST_DIR, ".nojekyll"), "");

  for (const route of ROUTES) {
    const routeDir = path.join(DIST_DIR, route);
    await mkdir(routeDir, { recursive: true });
    await cp(indexPath, path.join(routeDir, "index.html"));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
