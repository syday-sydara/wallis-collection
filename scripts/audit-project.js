#!/usr/bin/env node

/**
 * PROJECT AUDIT SCRIPT
 * --------------------
 * Scans the entire project, finds unused files, and moves them into:
 *
 *   /archive/<timestamp>/
 *
 * Safe: never deletes anything.
 */

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const ARCHIVE_DIR = path.join(ROOT, "archive", Date.now().toString());

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

const VALID_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".md",
  ".css",
  ".scss",
  ".html",
];

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

function extractImports(fileContent) {
  const importRegex =
    /(?:import|require)\s*(?:[\w{}\*\s,]*)\s*from\s*["'`](.*?)["'`]/g;

  const imports = [];
  let match;

  while ((match = importRegex.exec(fileContent))) {
    imports.push(match[1]);
  }

  return imports;
}

function resolveImport(importPath, fromFile) {
  if (importPath.startsWith(".")) {
    const resolved = path.resolve(path.dirname(fromFile), importPath);

    const candidates = [
      resolved,
      resolved + ".ts",
      resolved + ".tsx",
      resolved + ".js",
      resolved + ".jsx",
      path.join(resolved, "index.ts"),
      path.join(resolved, "index.tsx"),
      path.join(resolved, "index.js"),
    ];

    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
  }

  return null;
}

function audit() {
  console.log("🔍 Scanning project...");

  const allFiles = walk(ROOT).filter((f) =>
    VALID_EXTENSIONS.includes(path.extname(f))
  );

  const usedFiles = new Set();
  const fileImports = new Map();

  // Parse imports
  for (const file of allFiles) {
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

  // Determine unused files
  const unused = allFiles.filter((f) => !usedFiles.has(f));

  if (unused.length === 0) {
    console.log("✨ No unused files found!");
    return;
  }

  console.log(`⚠️ Found ${unused.length} unused files.`);
  console.log("📦 Moving to archive...");

  fs.mkdirSync(ARCHIVE_DIR, { recursive: true });

  for (const file of unused) {
    const rel = path.relative(ROOT, file);
    const dest = path.join(ARCHIVE_DIR, rel);

    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.renameSync(file, dest);

    console.log(`  → Archived: ${rel}`);
  }

  console.log(`\n🎉 Audit complete. Files moved to: ${ARCHIVE_DIR}`);
}

audit();
