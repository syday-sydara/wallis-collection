#!/usr/bin/env node

/**
 * WALLIS PROJECT AUDIT + ARCHITECTURE + SECURITY TOOL
 * ---------------------------------------------------
 * - Audits project structure and usage
 * - Applies architecture rules (built-in policy)
 * - Detects unused files/components/API/routes/models/exports/CSS/images
 * - Detects .env* and extra .gitignore files
 * - Scans for potential secrets
 * - Archives unused/violating files to archive/<timestamp>/
 * - Archives sensitive files to archive/<timestamp>/sensitive/
 * - Redacts secrets in archived .env* files
 * - Supports --dry and --interactive
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const ROOT = process.cwd();
const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const INTERACTIVE = args.includes("--interactive");

// ---------- ARCHIVE ROOT (auto-created, even if deleted) ----------
const ARCHIVE_ROOT = path.join(ROOT, "archive");

// ---------- ARCHITECTURE POLICY (embedded) ----------
const POLICY = {
  allowedRootFolders: [
    "app",
    "server",
    "lib",
    "prisma",
    "public",
    "scripts",
    "openapi",
  ],
  allowedLibFolders: [
    "validation",
    "db",
    "forms",
    "utils",
    "security",
    "risk",
    "messaging",
  ],
  allowedExtensions: [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".json",
    ".md",
    ".css",
    ".scss",
  ],
  protectedFiles: [
    "next.config.js",
    "package.json",
    "tsconfig.json",
    "prisma/schema.prisma",
    ".gitignore",
    ".env.example",
  ],
  treatAsViolations: [
    ".env",
    ".env.local",
    ".env.development",
    ".env.production",
    ".env.test",
    ".gitignore",
  ],
  autoFixRules: {
    moveUnknownLibFilesTo: "lib/utils",
    moveUnknownRootFilesTo: "archive",
    moveUnknownAssetsTo: "public/archive-assets",
    moveSpecialViolationsTo: "archive/sensitive",
  },
};

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
];

const VALID_CODE_EXT = [".ts", ".tsx", ".js", ".jsx"];
const VALID_ASSET_EXT = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"];
const VALID_STYLE_EXT = [".css", ".scss"];

// ---------- UTILITIES ----------

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

function isProtected(file) {
  const rel = path.relative(ROOT, file);
  return POLICY.protectedFiles.includes(rel);
}

function isValidExtension(file) {
  return POLICY.allowedExtensions.includes(path.extname(file));
}

function isValidRootFolder(file) {
  const rel = path.relative(ROOT, file);
  const rootFolder = rel.split(path.sep)[0];
  return POLICY.allowedRootFolders.includes(rootFolder);
}

function isValidLibFolder(file) {
  const rel = path.relative(ROOT, file);
  const parts = rel.split(path.sep);
  if (parts[0] !== "lib") return true;
  const sub = parts[1];
  return POLICY.allowedLibFolders.includes(sub);
}

function isSpecialViolation(file) {
  const filename = path.basename(file);
  return POLICY.treatAsViolations.includes(filename);
}

// ---------- SECRET SCANNER ----------

function scanForSecrets(file, content) {
  const findings = [];

  const patterns = [
    { name: "AWS key", regex: /AKIA[0-9A-Z]{16}/ },
    { name: "Bearer token", regex: /Bearer\s+[A-Za-z0-9\-_.]+/ },
    { name: "API key", regex: /api[_-]?key\s*=\s*["'][^"']+["']/i },
    { name: "Password", regex: /password\s*=\s*["'][^"']+["']/i },
    { name: "JWT", regex: /eyJ[A-Za-z0-9_-]+?\.[A-Za-z0-9_-]+?\.[A-Za-z0-9_-]+/ },
  ];

  for (const p of patterns) {
    if (p.regex.test(content)) {
      findings.push(p.name);
    }
  }

  if (findings.length > 0) {
    console.log(
      `🔐 Potential secrets in ${path.relative(ROOT, file)} → ${[
        ...new Set(findings),
      ].join(", ")}`
    );
  }
}

// ---------- REDACT .env CONTENT ----------

function redactEnvContent(content) {
  return content
    .split("\n")
    .map((line) => {
      if (!line.includes("=")) return line;
      if (line.trim().startsWith("#")) return line;
      const [key] = line.split("=");
      return `${key}=***REDACTED***`;
    })
    .join("\n");
}

// ---------- MAIN AUDIT ----------

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

  // Parse imports + scan for secrets
  for (const file of codeFiles) {
    const content = fs.readFileSync(file, "utf8");
    const imports = extractImports(content);
    fileImports.set(file, imports);
    scanForSecrets(file, content);
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

  // ---------- UNUSED FILES ----------
  const unusedFiles = codeFiles.filter((f) => !usedFiles.has(f));

  // ---------- UNUSED COMPONENTS ----------
  const unusedComponents = unusedFiles.filter((f) =>
    f.includes("components")
  );

  // ---------- UNUSED API ROUTES ----------
  const unusedApiRoutes = unusedFiles.filter((f) =>
    f.includes("app/api")
  );

  // ---------- UNUSED PRISMA MODELS ----------
  let unusedModels = [];
  const prismaPath = path.join(ROOT, "prisma/schema.prisma");
  if (fs.existsSync(prismaPath)) {
    const prismaSchema = fs.readFileSync(prismaPath, "utf8");
    const modelRegex = /model\s+(\w+)\s+{/g;
    const models = [];
    let match;
    while ((match = modelRegex.exec(prismaSchema))) {
      models.push(match[1]);
    }
    unusedModels = models.filter(
      (m) => !codeFiles.some((f) => fs.readFileSync(f, "utf8").includes(m))
    );
  }

  // ---------- UNUSED EXPORTS ----------
  const unusedExports = [];
  for (const file of codeFiles) {
    const content = fs.readFileSync(file, "utf8");
    const exportRegex = /export\s+(?:const|function|class)\s+(\w+)/g;
    let match;
    while ((match = exportRegex.exec(content))) {
      const name = match[1];
      const isUsed = codeFiles.some((f) => {
        if (f === file) return false;
        const c = fs.readFileSync(f, "utf8");
        return c.includes(name);
      });
      if (!isUsed) {
        unusedExports.push({ file, name });
      }
    }
  }

  // ---------- UNUSED CSS ----------
  const unusedCss = styleFiles.filter((cssFile) => {
    const cssName = path.basename(cssFile);
    return !codeFiles.some((f) => {
      const c = fs.readFileSync(f, "utf8");
      return c.includes(cssName);
    });
  });

  // ---------- UNUSED IMAGES ----------
  const unusedImages = assetFiles.filter((img) => {
    const imgName = path.basename(img);
    return !codeFiles.some((f) => {
      const c = fs.readFileSync(f, "utf8");
      return c.includes(imgName);
    });
  });

  // ---------- ARCHITECTURE VIOLATIONS ----------
  function isArchitectureViolation(file) {
    if (isProtected(file)) return false;
    if (isSpecialViolation(file)) return true;

    const rel = path.relative(ROOT, file);
    const parts = rel.split(path.sep);

    if (!isValidExtension(file)) return true;

    if (!isValidRootFolder(file)) return true;

    if (parts[0] === "lib" && !isValidLibFolder(file)) return true;

    return false;
  }

  const architectureViolations = allFiles.filter(isArchitectureViolation);

  // ---------- REPORT ----------
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

  // ---------- ARCHIVE SETUP ----------
  const timestamp = Date.now().toString();
  const archiveDir = path.join(ARCHIVE_ROOT, timestamp);
  const sensitiveDir = path.join(archiveDir, "sensitive");

  fs.mkdirSync(archiveDir, { recursive: true });
  fs.mkdirSync(sensitiveDir, { recursive: true });

  const toArchive = [
    ...unusedFiles,
    ...unusedCss,
    ...unusedImages,
    ...architectureViolations,
  ];

  console.log(`\n📦 Archiving ${toArchive.length} files to: ${archiveDir}`);

  for (const file of toArchive) {
    if (isProtected(file)) continue;

    const rel = path.relative(ROOT, file);
    const filename = path.basename(file);
    let dest;

    if (isSpecialViolation(file)) {
      dest = path.join(sensitiveDir, filename);
    } else {
      dest = path.join(archiveDir, rel);
    }

    if (INTERACTIVE) {
      const answer = await ask(`Archive ${rel}? (y/n): `);
      if (answer !== "y") continue;
    }

    fs.mkdirSync(path.dirname(dest), { recursive: true });

    // Special handling for .env* files: redact content
    if (isSpecialViolation(file) && filename.startsWith(".env")) {
      const content = fs.readFileSync(file, "utf8");
      const redacted = redactEnvContent(content);
      fs.writeFileSync(dest, redacted, "utf8");
      fs.unlinkSync(file);
      console.log(`  → Archived (redacted .env): ${rel}`);
    } else {
      fs.renameSync(file, dest);
      console.log(`  → Archived: ${rel}`);
    }
  }

  console.log("\n🎉 Audit + architecture + security pass complete!");
}

audit();
