import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE_ROOTS = [
  "axinite",
];
const LOCAL_LINK_ATTRIBUTES = ["href", "src"];
const HTML_FILES = [];
const issues = [];
const idsByFile = new Map();

async function main() {
  for (const sourceRoot of SOURCE_ROOTS) {
    const absolutePath = path.join(ROOT, sourceRoot);
    const sourceStat = await safeStat(absolutePath);

    if (!sourceStat) {
      issues.push(`missing source root: ${sourceRoot}`);
      continue;
    }

    if (sourceStat.isDirectory()) {
      await collectHtmlFiles(absolutePath);
      continue;
    }

    HTML_FILES.push(absolutePath);
  }

  HTML_FILES.sort();

  for (const htmlFile of HTML_FILES) {
    idsByFile.set(htmlFile, await collectIds(htmlFile));
  }

  for (const htmlFile of HTML_FILES) {
    await lintHtmlFile(htmlFile);
  }

  if (issues.length > 0) {
    console.error("Site lint failed:");

    for (const issue of issues) {
      console.error(`- ${issue}`);
    }

    process.exitCode = 1;
    return;
  }

  console.log(`Site lint passed for ${HTML_FILES.length} HTML files.`);
}

async function collectHtmlFiles(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      await collectHtmlFiles(entryPath);
      continue;
    }

    if (entry.isFile() && path.extname(entryPath) === ".html") {
      HTML_FILES.push(entryPath);
    }
  }
}

async function collectIds(filePath) {
  const html = await readFile(filePath, "utf8");
  const ids = new Set();

  for (const match of html.matchAll(/\sid=(["'])(.*?)\1/g)) {
    ids.add(match[2]);
  }

  return ids;
}

async function lintHtmlFile(filePath) {
  const html = await readFile(filePath, "utf8");
  const relativeFilePath = toRelative(filePath);

  for (const attribute of LOCAL_LINK_ATTRIBUTES) {
    const pattern = new RegExp(`\\s${attribute}=(["'])(.*?)\\1`, "g");

    for (const match of html.matchAll(pattern)) {
      const value = match[2];

      if (shouldSkipReference(value)) {
        continue;
      }

      const resolution = resolveReference(filePath, value);

      if (!resolution.filePath) {
        issues.push(`${relativeFilePath}: unresolved ${attribute}="${value}"`);
        continue;
      }

      const targetStat = await safeStat(resolution.filePath);

      if (!targetStat?.isFile()) {
        issues.push(
          `${relativeFilePath}: missing target for ${attribute}="${value}" -> ${toRelative(resolution.filePath)}`,
        );
        continue;
      }

      if (!resolution.fragment) {
        continue;
      }

      const ids = idsByFile.get(resolution.filePath);

      if (!ids?.has(resolution.fragment)) {
        issues.push(
          `${relativeFilePath}: missing fragment #${resolution.fragment} in ${toRelative(resolution.filePath)}`,
        );
      }
    }
  }
}

function resolveReference(sourceFilePath, reference) {
  if (reference.startsWith("#")) {
    return {
      filePath: sourceFilePath,
      fragment: reference.slice(1),
    };
  }

  const [pathWithQuery, fragment = ""] = reference.split("#", 2);
  const [rawPath] = pathWithQuery.split("?", 1);
  const sourceDirectory = path.dirname(sourceFilePath);
  const isRootRelative = rawPath.startsWith("/") && !rawPath.startsWith("//");
  let resolvedPath = isRootRelative
    ? path.join(ROOT, rawPath.slice(1))
    : path.resolve(sourceDirectory, rawPath);

  if (rawPath.endsWith("/")) {
    resolvedPath = path.join(resolvedPath, "index.html");
  } else {
    const extension = path.extname(resolvedPath);

    if (!extension) {
      const directoryIndexPath = path.join(resolvedPath, "index.html");

      return {
        filePath: directoryIndexPath,
        fragment,
      };
    }
  }

  return {
    filePath: resolvedPath,
    fragment,
  };
}

function shouldSkipReference(reference) {
  const trimmedReference = reference.trimStart();

  return (
    trimmedReference.length === 0 ||
    trimmedReference.startsWith("data:") ||
    trimmedReference.startsWith("http://") ||
    trimmedReference.startsWith("https://") ||
    trimmedReference.startsWith("//") ||
    trimmedReference.startsWith("mailto:") ||
    trimmedReference.startsWith("tel:") ||
    trimmedReference.startsWith("javascript:")
  );
}

function toRelative(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, "/");
}

async function safeStat(targetPath) {
  try {
    return await stat(targetPath);
  } catch {
    return null;
  }
}

await main();
