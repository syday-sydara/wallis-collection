#!/usr/bin/env node

/**
 * WALLIS ARCHITECTURE AUTO-FIXER
 * ------------------------------
 * Reads architecture.json and:
 *
 *  ✔ Detects files outside allowed folders
 *  ✔ Detects files with invalid extensions
 *  ✔ Detects files in wrong lib subfolders
 *  ✔ Moves files to correct locations based on autoFixRules
 *  ✔ Creates folders if needed
 *  ✔ Supports --dry and --interactive
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const ROOT = process.cwd();
const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const INTERACTIVE = args.includes("--interactive");

const policyPath = path.join(ROOT, "architecture.json");
if (!fs.existsSync(policyPath)) {
  console.error("❌ architecture.json not found.");
  process.exit(1);
}

const policy = JSON.parse(fs.readFileSync(policyPath, "utf8"));

function walk(dir) {
  const results = [];
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      if (file !== "node_modules" && file !== ".git" && file !== "archive") {
        results.push(...walk(full));
      }
    } else {
      results.push(full);
    }
  }
  return results;
}

function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

function isProtected(file) {
  const rel = path.relative(ROOT, file);
  return policy.protectedFiles.includes(rel);
}

function isValidExtension(file) {
  return policy.allowedExtensions.includes(path.extname(file));
}

function isValidRootFolder(file) {
  const rel = path.relative(ROOT, file);
  const rootFolder = rel.split(path.sep)[0];
  return policy.allowedRootFolders.includes(rootFolder);
}

function isValidLibFolder(file) {
  const rel = path.relative(ROOT, file);
  const parts = rel.split(path.sep);

  if (parts[0] !== "lib") return true; // not in lib → ignore

  const sub = parts[1];
  return policy.allowedLibFolders.includes(sub);
}

async function main() {
  console.log("🔍 Running architecture audit...");

  const allFiles = walk(ROOT);
  const violations = [];

  for (const file of allFiles) {
    if (isProtected(file)) continue;

    const rel = path.relative(ROOT, file);

    if (!isValidExtension(file)) {
      violations.push({ file, reason: "Invalid extension" });
      continue;
    }

    if (!isValidRootFolder(file)) {
      violations.push({ file, reason: "Invalid root folder" });
      continue;
    }

    if (!isValidLibFolder(file)) {
      violations.push({ file, reason: "Invalid lib subfolder" });
      continue;
    }
  }

  if (violations.length === 0) {
    console.log("✨ No architecture violations found.");
    return;
  }

  console.log(`⚠️ Found ${violations.length} architecture violations.`);

  for (const v of violations) {
    const rel = path.relative(ROOT, v.file);
    let dest;

    if (!isValidRootFolder(v.file)) {
      dest = path.join(ROOT, policy.autoFixRules.moveUnknownRootFilesTo, rel);
    } else if (!isValidLibFolder(v.file)) {
      const filename = path.basename(v.file);
      dest = path.join(ROOT, policy.autoFixRules.moveUnknownLibFilesTo, filename);
    } else if (!isValidExtension(v.file)) {
      const filename = path.basename(v.file);
      dest = path.join(ROOT, policy.autoFixRules.moveUnknownAssetsTo, filename);
    }

    if (!dest) continue;

    if (INTERACTIVE) {
      const answer = await ask(`Move ${rel} → ${path.relative(ROOT, dest)}? (y/n): `);
      if (answer !== "y") continue;
    }

    if (!DRY) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.renameSync(v.file, dest);
    }

    console.log(`  → Moved: ${rel}`);
  }

  console.log("\n🎉 Architecture auto-fix complete.");
}

main();
