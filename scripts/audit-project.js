#!/usr/bin/env node

/**
 * WALLIS PROJECT AUDIT TOOL
 * -------------------------
 * Performs a full audit of your project:
 *
 *  ✔ Unused file detection
 *  ✔ Unused component detection
 *  ✔ Unused API route detection
 *  ✔ Unused Prisma model detection
 *  ✔ Unused exports detection
 *  ✔ Unused CSS detection
 *  ✔ Unused image detection
 *  ✔ Dry-run mode (--dry)
 *  ✔ Interactive mode (--interactive)
 *  ✔ Auto-archive unused files
 *
 * Safe: never deletes anything.
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const ROOT = process.cwd();
const ARCHIVE_ROOT = path.join(ROOT, "archive");

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const INTERACTIVE = args.includes("--interactive");

const IGNORED_DIRS = [
  "node_modules",
  ".next",
  "dist",
  "build",
  "archive",
  ".git",
  ".turbo",
  ".vercel",
  "coverage",
  "scripts",
];

const VALID_CODE_EXT = [".ts", ".tsx", ".js", ".jsx"];
const VALID_ASSET_EXT = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"];
const VALID_STYLE_EXT = [".css", ".scss"];

/* ---------------------------------------------------------
 * UTILITIES
 * --------------------------------------------------------- */

function walk(dir) {
  const results = [];

  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      if (!IGNORED_DIRS.includes(file)) {
        results.push(...walk(full));
      }
    } else {
      results.push(full);
    }
  }

  return results;
}

function extractImports(content) {
  const regex =
    /(?:import|require)\s*(?:[\w{}\*\s,]*)\s*from\s*["'`](.*?)["'`]/g;

  const imports = [];
  let match;

  while ((match = regex.exec(content))) {
    imports.push(match[1]);
  }

  return imports;
}

function resolveImport(importPath, fromFile) {
  if (!importPath.startsWith(".")) return null;

  const base = path.resolve(path.dirname(fromFile), importPath);

  const candidates = [
    base,
    base + ".ts",
    base + ".tsx",
    base + ".js",
    base + ".jsx",
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
    path.join(base, "index.js"),
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }

  return null;
}

function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

/* ---------------------------------------------------------
 * AUDIT LOGIC
 * --------------------------------------------------------- */

async function audit() {
  console.log("🔍 Scanning project...");

  const allFiles = walk(ROOT);

  const codeFiles = allFiles.filter((f) =>
    VALID_CODE_EXT.includes(path.extname(f))
  );

  const assetFiles = allFiles.filter((f) =>
    VALID_ASSET_EXT.includes(path.extname(f))
  );

  const styleFiles = allFiles.filter((f) =>
    VALID_STYLE_EXT.includes(path.extname(f))
  );

  const usedFiles = new Set();
  const fileImports = new Map();

  // Parse imports
  for (const file of codeFiles) {
    const content = fs.readFileSync(file, "utf8");
    const imports = extractImports(content);
    fileImports.set(file, imports);
  }

  // Resolve imports
  for (const [file, imports] of fileImports.entries()) {
    for (const imp of imports) {
      const resolved = resolveImport(imp, file);
      if (resolved) usedFiles.add(resolved);
    }
  }

  // Mark entrypoints as used
  const ENTRYPOINTS = [
    "next.config.js",
    "package.json",
    "prisma/schema.prisma",
    "app/layout.tsx",
    "app/page.tsx",
    "server/api",
    "lib/validation",
    "lib/db",
  ];

  for (const entry of ENTRYPOINTS) {
    const full = path.join(ROOT, entry);
    if (fs.existsSync(full)) usedFiles.add(full);
  }

  /* ---------------------------------------------------------
   * UNUSED FILES
   * --------------------------------------------------------- */

  const unusedFiles = codeFiles.filter((f) => !usedFiles.has(f));

  /* ---------------------------------------------------------
   * UNUSED COMPONENTS
   * --------------------------------------------------------- */

  const unusedComponents = unusedFiles.filter((f) =>
    f.includes("components")
  );

  /* ---------------------------------------------------------
   * UNUSED API ROUTES
   * --------------------------------------------------------- */

  const unusedApiRoutes = unusedFiles.filter((f) =>
    f.includes("app/api")
  );

  /* ---------------------------------------------------------
   * UNUSED PRISMA MODELS
   * --------------------------------------------------------- */

  const prismaSchema = fs.readFileSync(
    path.join(ROOT, "prisma/schema.prisma"),
    "utf8"
  );

  const modelRegex = /model\s+(\w+)\s+{/g;
  const models = [];
  let match;

  while ((match = modelRegex.exec(prismaSchema))) {
    models.push(match[1]);
  }

  const unusedModels = models.filter(
    (m) => !codeFiles.some((f) => fs.readFileSync(f, "utf8").includes(m))
  );

  /* ---------------------------------------------------------
   * UNUSED EXPORTS
   * --------------------------------------------------------- */

  const unusedExports = [];

  for (const file of codeFiles) {
    const content = fs.readFileSync(file, "utf8");

    const exportRegex = /export\s+(?:const|function|class)\s+(\w+)/g;
    let match;

    while ((match = exportRegex.exec(content))) {
      const name = match[1];

      const isUsed = codeFiles.some((f) => {
        const c = fs.readFileSync(f, "utf8");
        return c.includes(name) && f !== file;
      });

      if (!isUsed) {
        unusedExports.push({ file, name });
      }
    }
  }

  /* ---------------------------------------------------------
   * UNUSED CSS
   * --------------------------------------------------------- */

  const unusedCss = styleFiles.filter((cssFile) => {
    const cssName = path.basename(cssFile);
    return !codeFiles.some((f) => {
      const c = fs.readFileSync(f, "utf8");
      return c.includes(cssName);
    });
  });

  /* ---------------------------------------------------------
   * UNUSED IMAGES
   * --------------------------------------------------------- */

  const unusedImages = assetFiles.filter((img) => {
    const imgName = path.basename(img);
    return !codeFiles.some((f) => {
      const c = fs.readFileSync(f, "utf8");
      return c.includes(imgName);
    });
  });

  /* ---------------------------------------------------------
   * REPORT
   * --------------------------------------------------------- */

  console.log("\n📊 AUDIT REPORT");
  console.log("──────────────────────────────");

  console.log(`📁 Unused files: ${unusedFiles.length}`);
  console.log(`🧩 Unused components: ${unusedComponents.length}`);
  console.log(`🔌 Unused API routes: ${unusedApiRoutes.length}`);
  console.log(`🗄️ Unused Prisma models: ${unusedModels.length}`);
  console.log(`📤 Unused exports: ${unusedExports.length}`);
  console.log(`🎨 Unused CSS: ${unusedCss.length}`);
  console.log(`🖼️ Unused images: ${unusedImages.length}`);
  console.log(`🏗️ Architecture violations: ${architectureViolations.length}`);


  if (DRY) {
    console.log("\n💡 Dry run mode: no files will be moved.");
    return;
  }

  /* ---------------------------------------------------------
 * ARCHITECTURE VIOLATIONS
 * --------------------------------------------------------- */

const ALLOWED_ROOT_FOLDERS = [
  "app",
  "server",
  "lib",
  "prisma",
  "public",
  "scripts",
  "openapi",
];

const ALLOWED_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".css",
  ".scss",
];

function isArchitectureViolation(file) {
  const rel = path.relative(ROOT, file);
  const parts = rel.split(path.sep);

  // 1. File in unexpected root folder
  if (!ALLOWED_ROOT_FOLDERS.includes(parts[0])) {
    return true;
  }

  // 2. File with unexpected extension
  if (!ALLOWED_EXTENSIONS.includes(path.extname(file))) {
    return true;
  }

  // 3. File inside lib/ but not in allowed subfolders
  if (parts[0] === "lib") {
    const allowedLib = [
      "validation",
      "db",
      "forms",
      "utils",
      "security",
      "risk",
      "messaging",
    ];
    if (!allowedLib.includes(parts[1])) {
      return true;
    }
  }

  return false;
}

const architectureViolations = allFiles.filter(isArchitectureViolation);

  /* ---------------------------------------------------------
   * ARCHIVE
   * --------------------------------------------------------- */

  const archiveDir = path.join(ARCHIVE_ROOT, Date.now().toString());
  fs.mkdirSync(archiveDir, { recursive: true });

  const toArchive = [
  ...unusedFiles,
  ...unusedCss,
  ...unusedImages,
  ...architectureViolations,
];


  console.log(`\n📦 Archiving ${toArchive.length} files to: ${archiveDir}`);

  for (const file of toArchive) {
    const rel = path.relative(ROOT, file);
    const dest = path.join(archiveDir, rel);

    if (INTERACTIVE) {
      const answer = await ask(`Archive ${rel}? (y/n): `);
      if (answer !== "y") continue;
    }

    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.renameSync(file, dest);
    console.log(`  → Archived: ${rel}`);
  }

  console.log("\n🎉 Audit complete!");
}

audit();
