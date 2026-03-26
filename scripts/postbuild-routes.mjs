import { cp, mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DIST_DIR = path.join(process.cwd(), "dist");
const DEPLOY_BASE_PATH = "/axinite-mockup/";
const DEPLOY_DIR = path.join(
  DIST_DIR,
  DEPLOY_BASE_PATH.replace(/^\/+|\/+$/g, "")
);
const ROUTES = ["chat", "memory", "jobs", "routines", "extensions", "skills"];

function buildRedirectHtml(route) {
  const targetPath = `${DEPLOY_BASE_PATH}${route}`.replace(/\/{2,}/g, "/");

  return `<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Redirecting to Axinite</title>
    <meta http-equiv="refresh" content="0; url=${targetPath}" />
    <script type="module">
      const target = new URL(${JSON.stringify(targetPath)}, window.location.origin);
      target.search = window.location.search;
      target.hash = window.location.hash;
      window.location.replace(target.toString());
    </script>
  </head>
  <body>
    <p>
      Redirecting to
      <a href="${targetPath}">${targetPath}</a>.
    </p>
  </body>
</html>
`;
}

async function main() {
  const indexPath = path.join(DIST_DIR, "index.html");
  await writeFile(path.join(DIST_DIR, ".nojekyll"), "");

  for (const route of ROUTES) {
    const routeDir = path.join(DIST_DIR, route);
    await mkdir(routeDir, { recursive: true });
    await cp(indexPath, path.join(routeDir, "index.html"));
  }

  await mkdir(DEPLOY_DIR, { recursive: true });

  const topLevelEntries = await readdir(DIST_DIR, { withFileTypes: true });

  for (const entry of topLevelEntries) {
    if (entry.name === path.basename(DEPLOY_DIR)) {
      continue;
    }

    const sourcePath = path.join(DIST_DIR, entry.name);
    const targetPath = path.join(DEPLOY_DIR, entry.name);

    await cp(sourcePath, targetPath, { recursive: true });
  }

  for (const route of ROUTES) {
    const routeDir = path.join(DIST_DIR, route);
    await writeFile(path.join(routeDir, "index.html"), buildRedirectHtml(route));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
