import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const TARGETS = [
  "AGENTS.md",
  "Makefile",
  "axinite",
  "scripts",
];
const EXTENSIONS = new Set([".css", ".html", ".js", ".json", ".md", ".mjs"]);
const failures = [];

async function main() {
  const files = [];

  for (const target of TARGETS) {
    const absoluteTarget = path.join(ROOT, target);
    const stat = await safeStat(absoluteTarget);

    if (!stat) {
      continue;
    }

    if (stat.isDirectory()) {
      await collectFiles(absoluteTarget, files);
      continue;
    }

    if (shouldCheckFile(absoluteTarget)) {
      files.push(absoluteTarget);
    }
  }

  files.sort();

  for (const filePath of files) {
    const content = await readFile(filePath, "utf8");
    const relativePath = path.relative(ROOT, filePath).replace(/\\/g, "/");

    if (content.includes("\t")) {
      failures.push(`${relativePath}: contains tab characters`);
    }

    const lines = content.split("\n");

    for (let index = 0; index < lines.length; index += 1) {
      if (/[ \t]+$/.test(lines[index])) {
        failures.push(`${relativePath}:${index + 1}: trailing whitespace`);
      }
    }

    if (!content.endsWith("\n")) {
      failures.push(`${relativePath}: missing trailing newline`);
    }
  }

  if (failures.length > 0) {
    console.error("Formatting check failed:");

    for (const failure of failures) {
      console.error(`- ${failure}`);
    }

    process.exitCode = 1;
    return;
  }

  console.log(`Formatting check passed for ${files.length} files.`);
}

async function collectFiles(directoryPath, files) {
  const entries = await readdir(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      await collectFiles(entryPath, files);
      continue;
    }

    if (entry.isFile() && shouldCheckFile(entryPath)) {
      files.push(entryPath);
    }
  }
}

function shouldCheckFile(filePath) {
  return EXTENSIONS.has(path.extname(filePath));
}

async function safeStat(targetPath) {
  try {
    return await import("node:fs/promises").then(({ stat }) => stat(targetPath));
  } catch {
    return null;
  }
}

await main();
