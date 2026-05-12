#!/usr/bin/env ts-node

import { mkdirSync, writeFileSync, existsSync, readFileSync } from "fs";
import { join } from "path";

// ------------------------------------------------------
// CLI FLAGS
// ------------------------------------------------------
const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args.map((arg) => {
    const [key, value] = arg.replace(/^--/, "").split("=");
    return [key, value ?? true];
  })
);

const MODULE = flags.module || null;
const FORCE = Boolean(flags.force);
const DRY = Boolean(flags["dry-run"]);

const root = process.cwd();

// ------------------------------------------------------
// HELPERS
// ------------------------------------------------------
function createDir(path: string) {
  const full = join(root, path);
  if (!existsSync(full)) {
    if (!DRY) mkdirSync(full, { recursive: true });
    console.log("📁 Created:", path);
  }
}

function createFile(path: string, content = "") {
  const full = join(root, path);
  if (existsSync(full) && !FORCE) {
    console.log("⚠️ Skipped (exists):", path);
    return;
  }
  if (!DRY) writeFileSync(full, content);
  console.log("📄 Created:", path);
}

function render(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || "");
}

// ------------------------------------------------------
// REAL WALLIS BACKEND TEMPLATES
// ------------------------------------------------------

const routeTemplate = `
import { Router } from "express";
import { withHandler } from "@/lib/with-handler";
import { {{Name}}Service } from "@/services/{{name}}.service";

const router = Router();

router.get("/", withHandler(() => {{Name}}Service.list()));
router.get("/:id", withHandler((req) => {{Name}}Service.get(req.params.id)));
router.post("/", withHandler((req) => {{Name}}Service.create(req.body)));
router.patch("/:id", withHandler((req) => {{Name}}Service.update(req.params.id, req.body)));
router.delete("/:id", withHandler((req) => {{Name}}Service.remove(req.params.id)));

export default router;
`;

const serviceTemplate = `
import { prisma } from "@/lib/prisma";
import { {{Name}}Mapper, {{Name}}ReverseMapper } from "@/mappers/{{name}}.mapper";

export class {{Name}}Service {
  static async list() {
    const rows = await prisma.{{name}}.findMany();
    return rows.map({{Name}}Mapper.toDTO);
  }

  static async get(id: string) {
    const row = await prisma.{{name}}.findUnique({ where: { id } });
    if (!row) throw new Error("{{Name}} not found");
    return {{Name}}Mapper.toDTO(row);
  }

  static async create(input: any) {
    const data = {{Name}}ReverseMapper.toPrismaCreate(input);
    const created = await prisma.{{name}}.create({ data });
    return {{Name}}Mapper.toDTO(created);
  }

  static async update(id: string, input: any) {
    const data = {{Name}}ReverseMapper.toPrismaUpdate(input);
    const updated = await prisma.{{name}}.update({ where: { id }, data });
    return {{Name}}Mapper.toDTO(updated);
  }

  static async remove(id: string) {
    await prisma.{{name}}.delete({ where: { id } });
    return { id };
  }
}
`;

const mapperTemplate = `
export const {{Name}}Mapper = {
  toDTO(entity: any) {
    return {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  },
};

export const {{Name}}ReverseMapper = {
  toPrismaCreate(input: any) {
    return input;
  },
  toPrismaUpdate(input: any) {
    return input;
  },
};
`;

const adminTransformerTemplate = `
export const {{Name}}AdminTransformer = {
  toRow(entity: any) {
    return {
      id: entity.id,
      createdAt: new Date(entity.createdAt).toLocaleString("en-CA"),
    };
  },
};
`;

const indexTemplate = `
export * from "./{{name}}.mapper";
`;

// ------------------------------------------------------
// MODULE GENERATION
// ------------------------------------------------------
function generateModule(name: string) {
  const Name = name.charAt(0).toUpperCase() + name.slice(1);

  createDir(`src/routes`);
  createDir(`src/services`);
  createDir(`src/mappers`);
  createDir(`src/admin/transformers`);

  createFile(`src/routes/${name}.route.ts`, render(routeTemplate, { name, Name }));
  createFile(`src/services/${name}.service.ts`, render(serviceTemplate, { name, Name }));
  createFile(`src/mappers/${name}.mapper.ts`, render(mapperTemplate, { name, Name }));
  createFile(`src/admin/transformers/${name}.transformer.ts`, render(adminTransformerTemplate, { name, Name }));

  // Update mapper index
  const indexPath = `src/mappers/index.ts`;
  const exportLine = `export * from "./${name}.mapper";\n`;

  if (!existsSync(indexPath)) {
    createFile(indexPath, exportLine);
  } else {
    const content = readFileSync(indexPath, "utf8");
    if (!content.includes(exportLine)) {
      if (!DRY) writeFileSync(indexPath, content + exportLine);
      console.log("🔄 Updated mapper index");
    }
  }

  console.log(`✨ Module '${name}' generated successfully`);
}

// ------------------------------------------------------
// FULL BACKEND STRUCTURE
// ------------------------------------------------------

const baseStructure = {
  "src": {
    "server.ts": "// server entrypoint\nexport {};",
    "routes": {},
    "services": {},
    "mappers": { "index.ts": "// mapper index\nexport {};" },
    "admin": { "transformers": {} },
    "lib": {
      "prisma.ts": "// prisma client",
      "with-handler.ts": "// API handler wrapper",
      "idempotency.ts": "// idempotency engine",
      "correlation.ts": "// correlation IDs",
      "logger.ts": "// logger",
      "metrics.ts": "// metrics",
      "circuit-breakers.ts": "// circuit breaker",
      "whatsapp-retry-wrapper.ts": "// whatsapp retry wrapper",
    },
    "providers": {
      "whatsapp.provider.ts": "// whatsapp provider",
    },
    "queues": {
      "messaging": {
        "whatsapp-retry.queue.ts": "// whatsapp retry queue",
        "whatsapp-retry.worker.ts": "// whatsapp retry worker",
      }
    },
    "types": {
      "domain": {
        "order.ts": "// order domain model",
        "payment.ts": "// payment domain model",
        "product.ts": "// product domain model",
        "customer.ts": "// customer domain model",
        "inventory.ts": "// inventory domain model",
        "enums.ts": "// domain enums",
      }
    }
  },
  "openapi": { "wallis-api.yaml": "// OpenAPI spec" },
  "tests": {
    "contracts": {},
    "schemas": {}
  }
};

function generateStructure(base: string, obj: any) {
  for (const key in obj) {
    const value = obj[key];
    const path = join(base, key);

    if (typeof value === "string") {
      createFile(path, value);
    } else if (typeof value === "object") {
      createDir(path);
      generateStructure(path, value);
    }
  }
}

// ------------------------------------------------------
// EXECUTION
// ------------------------------------------------------
if (MODULE) {
  generateModule(MODULE);
} else {
  generateStructure("", baseStructure);
  console.log("\n✨ Backend structure generated successfully!");
}
