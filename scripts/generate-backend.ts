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
function normalizeName(name: string) {
  return name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .toLowerCase();
}

function pascalCase(name: string) {
  return name
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

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

function appendToFile(path: string, content: string) {
  const full = join(root, path);
  if (!existsSync(full)) {
    if (!DRY) writeFileSync(full, content);
    console.log("📄 Created:", path);
    return;
  }
  const existing = readFileSync(full, "utf8");
  if (!existing.includes(content)) {
    if (!DRY) writeFileSync(full, existing + (existing.endsWith("\n") ? "" : "\n") + content);
    console.log("🔄 Updated:", path);
  } else {
    console.log("⚠️ Skipped (already contains content):", path);
  }
}

function render(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || "");
}

// ------------------------------------------------------
// TEMPLATES
// ------------------------------------------------------
const routeTemplate = `
import { Router } from "express";
import { withHandler } from "@/lib/with-handler";
import { {{Name}}Service } from "@/services/{{name}}.service";

const router = Router();

router.get(
  "/",
  withHandler(async () => {
    return await {{Name}}Service.list();
  })
);

router.get(
  "/:id",
  withHandler(async (req) => {
    return await {{Name}}Service.get(req.params.id);
  })
);

router.post(
  "/",
  withHandler(async (req) => {
    return await {{Name}}Service.create(req.body);
  })
);

router.patch(
  "/:id",
  withHandler(async (req) => {
    return await {{Name}}Service.update(req.params.id, req.body);
  })
);

router.delete(
  "/:id",
  withHandler(async (req) => {
    return await {{Name}}Service.remove(req.params.id);
  })
);

export default router;
`.trimStart();

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
    if (!row) {
      throw new Error("{{Name}} not found");
    }
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
`.trimStart();

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
`.trimStart();

const adminTransformerTemplate = `
export const {{Name}}AdminTransformer = {
  toRow(entity: any) {
    return {
      id: entity.id,
      createdAt: new Date(entity.createdAt).toLocaleString("en-CA"),
    };
  },
};
`.trimStart();

const testContractTemplate = `
import request from "supertest";
import { app } from "@/server";
import { ApiSuccessSchema } from "@/tests/schemas/api-envelope.schema";
import { {{Name}}Schema } from "@/tests/schemas/{{name}}.schema";

describe("{{Name}} Contract Tests", () => {
  it("GET /api/{{name}} returns valid list", async () => {
    const res = await request(app).get("/api/{{name}}").expect(200);

    const envelope = ApiSuccessSchema.parse(res.body);
    const list = envelope.data;

    list.forEach((item: any) => {{Name}}Schema.parse(item));
  });
});
`.trimStart();

const testSchemaTemplate = `
import { z } from "zod";

export const {{Name}}Schema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
`.trimStart();

const apiEnvelopeSchemaTemplate = `
import { z } from "zod";

export const ApiSuccessSchema = z.object({
  ok: z.literal(true),
  data: z.any(),
  traceId: z.string().optional(),
});

export const ApiErrorSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
    details: z.any().optional(),
  }),
  traceId: z.string().optional(),
});
`.trimStart();

const openApiPathTemplate = `
  /api/{{name}}:
    get:
      summary: List {{Name}}
      responses:
        "200":
          description: OK
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/{{Name}}ListResponse"
    post:
      summary: Create {{Name}}
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/Create{{Name}}Input"
      responses:
        "201":
          description: Created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/{{Name}}Response"
`.trimStart();

// ------------------------------------------------------
// MODULE GENERATION
// ------------------------------------------------------
function generateModule(rawName: string) {
  const normalized = normalizeName(rawName);
  const Name = pascalCase(normalized);
  const name = normalized;

  console.log(`\n🚀 Generating module: ${name}`);

  // Core dirs
  createDir(`src/routes`);
  createDir(`src/services`);
  createDir(`src/mappers`);
  createDir(`src/admin/transformers`);
  createDir(`tests/contracts`);
  createDir(`tests/schemas`);
  createDir(`tests/schemas`); // for api-envelope if needed
  createDir(`openapi`);

  // Core files
  createFile(
    `src/routes/${name}.route.ts`,
    render(routeTemplate, { name, Name })
  );

  createFile(
    `src/services/${name}.service.ts`,
    render(serviceTemplate, { name, Name })
  );

  createFile(
    `src/mappers/${name}.mapper.ts`,
    render(mapperTemplate, { name, Name })
  );

  createFile(
    `src/admin/transformers/${name}.transformer.ts`,
    render(adminTransformerTemplate, { name, Name })
  );

  // Tests
  createFile(
    `tests/contracts/${name}.contract.test.ts`,
    render(testContractTemplate, { name, Name })
  );

  createFile(
    `tests/schemas/${name}.schema.ts`,
    render(testSchemaTemplate, { name, Name })
  );

  // Ensure API envelope schema exists
  createFile(
    `tests/schemas/api-envelope.schema.ts`,
    apiEnvelopeSchemaTemplate
  );

  // Mapper index
  appendToFile(
    `src/mappers/index.ts`,
    `export * from "./${name}.mapper";`
  );

  // OpenAPI
  appendToFile(
    `openapi/wallis-api.yaml`,
    render(openApiPathTemplate, { name, Name })
  );

  console.log(`✨ Module '${name}' generated successfully`);
}

// ------------------------------------------------------
// FULL BACKEND STRUCTURE
// ------------------------------------------------------

const baseStructure = {
  "src": {
    "server.ts": `// server entrypoint
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

export { app };
`,
    "routes": {},
    "services": {},
    "mappers": { "index.ts": "// mapper index\nexport {};" },
    "admin": { "transformers": {} },
    "lib": {
      "prisma.ts": "// prisma client",
      "with-handler.ts": `// API handler wrapper
import type { Request, Response, NextFunction } from "express";

type HandlerFn = (req: Request, res: Response) => Promise<any> | any;
type SimpleHandlerFn = (req: Request) => Promise<any> | any | void;
type NoReqHandlerFn = () => Promise<any> | any;

export function withHandler(fn: HandlerFn | SimpleHandlerFn | NoReqHandlerFn) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = fn.length >= 2 ? await (fn as HandlerFn)(req, res) : await (fn as any)(req);
      if (res.headersSent) return;
      if (result === undefined) return;
      res.json({ ok: true, data: result });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({
        ok: false,
        error: { message: err?.message || "Internal Server Error" },
      });
    }
  };
}
`,
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
  "openapi": { "wallis-api.yaml": "# Wallis API OpenAPI spec\n" },
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
  generateModule(String(MODULE));
} else {
  generateStructure("", baseStructure);
  console.log("\n✨ Backend structure generated successfully!");
}
