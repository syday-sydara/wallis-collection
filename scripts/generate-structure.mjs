#!/usr/bin/env node
import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

// ------------------------------------------------------
// CLI FLAGS
// ------------------------------------------------------
const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const FORCE = args.includes("--force");
const SILENT = args.includes("--silent");

const rootFlagIndex = args.indexOf("--root");
const ROOT =
  rootFlagIndex !== -1 && args[rootFlagIndex + 1]
    ? join(process.cwd(), args[rootFlagIndex + 1])
    : process.cwd();

// ------------------------------------------------------
// LOGGING HELPERS
// ------------------------------------------------------
const color = {
  green: (msg) => `\x1b[32m${msg}\x1b[0m`,
  yellow: (msg) => `\x1b[33m${msg}\x1b[0m`,
  blue: (msg) => `\x1b[34m${msg}\x1b[0m`,
};

function log(msg) {
  if (!SILENT) console.log(msg);
}

// ------------------------------------------------------
// COUNTERS
// ------------------------------------------------------
let createdDirs = 0;
let createdFiles = 0;

// ------------------------------------------------------
// FILESYSTEM HELPERS
// ------------------------------------------------------
function createDir(path) {
  const full = join(ROOT, path);

  if (DRY) {
    log(color.blue(`📁 Would create: ${path}`));
    return;
  }

  if (!existsSync(full)) {
    mkdirSync(full, { recursive: true });
    writeFileSync(join(full, ".gitkeep"), "");
    createdDirs++;
    log(color.green(`📁 Created: ${path}`));
  } else {
    log(color.yellow(`⚠️  Skipped (exists): ${path}`));
  }
}

function createFile(path, content = "") {
  const full = join(ROOT, path);

  if (DRY) {
    log(color.blue(`📄 Would create: ${path}`));
    return;
  }

  if (!existsSync(full) || FORCE) {
    writeFileSync(full, content);
    createdFiles++;
    log(color.green(`📄 Created: ${path}`));
  } else {
    log(color.yellow(`⚠️  Skipped (exists): ${path}`));
  }
}

// ------------------------------------------------------
// TEMPLATE HELPERS
// ------------------------------------------------------
const page = (content = "") =>
  `export default function Page() {\n  return <div>${content}</div>;\n}\n`;

const layout = () =>
  `export default function Layout({ children }) {\n  return <div>{children}</div>;\n}\n`;

const route = () =>
  `export async function GET() { return Response.json({ ok: true }); }\n`;

// ------------------------------------------------------
// TYPE-SAFE STRUCTURE DEFINITION
// ------------------------------------------------------
/**
 * @typedef {string | Record<string, Node>} Node
 */

/** @type {Record<string, Node>} */
const structure = {
  app: {
    "layout.tsx": layout(),
    "page.tsx": page("Landing Page"),

    "(shop)": {
      "layout.tsx": layout(),
      products: {
        "page.tsx": page("Products"),
        "[slug]": { "page.tsx": page("Product Detail") },
      },
      cart: { "page.tsx": page("Cart") },
      checkout: { "page.tsx": page("Checkout") },
      orders: {
        "page.tsx": page("Orders"),
        "[id]": { "page.tsx": page("Order Detail") },
      },
    },

    "(admin)": {
      "layout.tsx": layout(),
      dashboard: { "page.tsx": page("Admin Dashboard") },

      orders: {
        "page.tsx": page("Admin Orders"),
        "[id]": {
          "page.tsx": page("Order Detail"),
          timeline: { "page.tsx": page("Order Timeline") },
        },
      },

      payments: {
        "page.tsx": page("Payments"),
        "[id]": {
          "page.tsx": page("Payment Detail"),
          timeline: { "page.tsx": page("Payment Timeline") },
        },
      },

      inventory: {
        "page.tsx": page("Inventory"),
        variants: { "page.tsx": page("Variants") },
        reservations: { "page.tsx": page("Reservations") },
      },

      sessions: {
        "page.tsx": page("Sessions"),
        "[id]": {
          "page.tsx": page("Session Detail"),
          messages: { "page.tsx": page("Session Messages") },
        },
      },

      observability: {
        queues: { "page.tsx": page("Queues") },
        dlq: { "page.tsx": page("DLQ") },
        messages: { "page.tsx": page("Message Logs") },
        audit: { "page.tsx": page("Audit Logs") },
      },
    },

    api: {
      products: {
        "route.ts": route(),
        "[slug]": { "route.ts": route() },
      },
      reservations: {
        create: { "route.ts": route() },
      },
      orders: {
        create: { "route.ts": route() },
        "[id]": { "route.ts": route() },
      },
      payments: {
        create: { "route.ts": route() },
        verify: { "route.ts": route() },
      },
      admin: {
        queues: { "route.ts": route() },
        dlq: { "route.ts": route() },
        messages: { "route.ts": route() },
        audit: { "route.ts": route() },
      },
    },
  },

  lib: {
    api: {},
    utils: {},
    schemas: {},
    types: {},
  },

  components: {},
  hooks: {},
  styles: {},
};

// ------------------------------------------------------
// RECURSIVE GENERATOR
// ------------------------------------------------------
function generate(base, obj) {
  for (const key in obj) {
    const value = obj[key];
    const path = join(base, key);

    if (typeof value === "string") {
      createFile(path, value);
    } else if (typeof value === "object") {
      createDir(path);
      generate(path, value);
    }
  }
}

generate("", structure);

// ------------------------------------------------------
// SUMMARY
// ------------------------------------------------------
if (!SILENT) {
  console.log("\n✨ Generation complete");
  console.log(`📁 Directories created: ${createdDirs}`);
  console.log(`📄 Files created: ${createdFiles}`);
  console.log(`📌 Root: ${ROOT}`);
  console.log(DRY ? "🔍 Dry run mode" : FORCE ? "⚠️ Force overwrite mode" : "");
}
