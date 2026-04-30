#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const PRISMA_SCHEMA = path.join(process.cwd(), "prisma/schema.prisma");
const VALIDATION_DIR = path.join(process.cwd(), "lib/validation");
const DB_DIR = path.join(process.cwd(), "lib/db");
const API_DIR = path.join(process.cwd(), "server/api");
const FORMS_DIR = path.join(process.cwd(), "lib/forms");
const OPENAPI_DIR = path.join(process.cwd(), "openapi/components");

const GENERATED_START = "// === AUTO-GENERATED START ===";
const GENERATED_END = "// === AUTO-GENERATED END ===";

const args = process.argv.slice(2);
const WATCH = args.includes("--watch");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readSchema() {
  return fs.readFileSync(PRISMA_SCHEMA, "utf8");
}

function extractModelsAndEnums(schema) {
  const modelRegex = /model\s+(\w+)\s+{([^}]*)}/gms;
  const enumRegex = /enum\s+(\w+)\s+{([^}]*)}/gms;

  const models = [];
  const enums = {};

  let match;

  while ((match = enumRegex.exec(schema))) {
    const [, name, body] = match;
    enums[name] = body
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("//"));
  }

  while ((match = modelRegex.exec(schema))) {
    const [, name, body] = match;

    const fields = body
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => {
        if (!l) return false;
        if (l.startsWith("//")) return false;
        if (l.startsWith("@@")) return false;
        return true;
      })
      .map((line) => {
        const parts = line.split(/\s+/);
        const field = parts[0];
        const type = parts[1];
        if (!type) return null;
        return { field, type, raw: line };
      })
      .filter(Boolean);

    models.push({ name, fields });
  }

  return { models, enums };
}

function zodType(type, enums, modelNames) {
  const isArray = type.endsWith("[]");
  const clean = type.replace("?", "").replace("[]", "");

  let base;
  if (enums[clean]) {
    base = `z.enum([${enums[clean].map((v) => `"${v}"`).join(", ")}])`;
  } else {
    switch (clean) {
      case "String":
        base = "z.string()";
        break;
      case "Int":
      case "Float":
        base = "z.number()";
        break;
      case "Boolean":
        base = "z.boolean()";
        break;
      case "DateTime":
        base = "z.date()";
        break;
      case "Json":
        base = "z.any()";
        break;
      default:
        // relation or unknown → string id by default
        base = "z.string()";
        break;
    }
  }

  if (isArray) base = `z.array(${base})`;
  return base;
}

function generateSchema(model, enums, modelNames) {
  const fields = model.fields
    .map(({ field, type, raw }) => {
      const isOptional = raw.includes("?");
      let base = zodType(type, enums, modelNames);
      if (isOptional) base += ".optional()";
      return `  ${field}: ${base},`;
    })
    .join("\n");

  return `
${GENERATED_START}
import { z } from "zod";

export const ${model.name}Schema = z.object({
${fields}
});
${GENERATED_END}
`;
}

function generateValidator(model) {
  return `
${GENERATED_START}
import { ${model.name}Schema } from "../schemas/${model.name}.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validate${model.name}(input: unknown) {
  return safeParseOrThrow(${model.name}Schema, input);
}
${GENERATED_END}
`;
}

function generateType(model) {
  return `
${GENERATED_START}
import { z } from "zod";
import { ${model.name}Schema } from "../schemas/${model.name}.schema";

export type ${model.name}Input = z.infer<typeof ${model.name}Schema>;
${GENERATED_END}
`;
}

function writeGeneratedFile(filePath, content) {
  ensureDir(path.dirname(filePath));

  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, "utf8");
    if (existing.includes(GENERATED_START)) {
      const updated = existing.replace(
        new RegExp(`${GENERATED_START}[\\s\\S]*?${GENERATED_END}`),
        content
      );
      fs.writeFileSync(filePath, updated);
      return;
    }
  }

  fs.writeFileSync(filePath, content);
}

function generateIndexFile(dir, pattern, exportSuffix) {
  if (!fs.existsSync(dir)) return;
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(pattern))
    .map((f) => path.basename(f, pattern));

  const lines = files.map((name) => `export * from "./${name}${exportSuffix}";`);
  fs.writeFileSync(path.join(dir, "index.ts"), lines.join("\n") + "\n");
}

function generateEnumsFile(enums) {
  const lines = Object.entries(enums).map(([name, values]) => {
    const arr = values.map((v) => `"${v}"`).join(", ");
    return `
export const ${name} = [${arr}] as const;
export type ${name} = (typeof ${name})[number];
`;
  });

  writeGeneratedFile(
    path.join(VALIDATION_DIR, "enums.ts"),
    `
${GENERATED_START}
${lines.join("\n")}
${GENERATED_END}
`
  );
}

function toCamel(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function generateRepository(model) {
  const name = model.name;
  const camel = toCamel(name);

  return `
${GENERATED_START}
import { prisma } from "@/lib/db/client";
import type { ${name}Input } from "@/lib/validation/types/${name}.types";

export const ${camel}Repository = {
  async findById(id: string) {
    return prisma.${camel}.findUnique({ where: { id } });
  },

  async findMany(args: any = {}) {
    return prisma.${camel}.findMany(args);
  },

  async create(data: ${name}Input) {
    return prisma.${camel}.create({ data });
  },

  async update(id: string, data: Partial<${name}Input>) {
    return prisma.${camel}.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.${camel}.delete({ where: { id } });
  },
};
${GENERATED_END}
`;
}

function generateRouter(model) {
  const name = model.name;
  const camel = toCamel(name);

  return `
${GENERATED_START}
import { z } from "zod";
import { publicProcedure, router } from "@/server/trpc";
import { ${name}Schema } from "@/lib/validation/schemas/${name}.schema";
import { ${camel}Repository } from "@/lib/db/${name}Repository";

export const ${camel}Router = router({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => ${camel}Repository.findById(input.id)),

  list: publicProcedure
    .input(z.any().optional())
    .query(({ input }) => ${camel}Repository.findMany(input)),

  create: publicProcedure
    .input(${name}Schema)
    .mutation(({ input }) => ${camel}Repository.create(input)),

  update: publicProcedure
    .input(z.object({ id: z.string(), data: ${name}Schema.partial() }))
    .mutation(({ input }) => ${camel}Repository.update(input.id, input.data)),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input }) => ${camel}Repository.delete(input.id)),
});
${GENERATED_END}
`;
}

function generateForm(model) {
  const name = model.name;

  return `
${GENERATED_START}
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ${name}Schema } from "@/lib/validation/schemas/${name}.schema";
import type { ${name}Input } from "@/lib/validation/types/${name}.types";

export function use${name}Form(defaultValues?: Partial<${name}Input>) {
  return useForm<${name}Input>({
    resolver: zodResolver(${name}Schema),
    defaultValues: defaultValues as any,
  });
}
${GENERATED_END}
`;
}

function generateOpenApiComponent(model) {
  const properties = {};
  for (const f of model.fields) {
    const clean = f.type.replace("?", "").replace("[]", "");
    let type = "string";
    if (["Int", "Float"].includes(clean)) type = "number";
    if (clean === "Boolean") type = "boolean";

    properties[f.field] = { type };
  }

  const schema = {
    type: "object",
    properties,
  };

  ensureDir(OPENAPI_DIR);
  fs.writeFileSync(
    path.join(OPENAPI_DIR, `${model.name}.json`),
    JSON.stringify(schema, null, 2)
  );
}

function runPrettier() {
  try {
    spawnSync("npx", ["prettier", "--write", "lib/validation", "lib/db", "server/api", "lib/forms"], {
      stdio: "inherit",
      shell: true,
    });
  } catch {
    // ignore if prettier not installed
  }
}

function generateAll() {
  console.log("🔍 Reading Prisma schema...");
  const schema = readSchema();

  console.log("📦 Extracting models & enums...");
  const { models, enums } = extractModelsAndEnums(schema);
  const modelNames = models.map((m) => m.name);

  const schemaDir = path.join(VALIDATION_DIR, "schemas");
  const validatorDir = path.join(VALIDATION_DIR, "validators");
  const typesDir = path.join(VALIDATION_DIR, "types");

  ensureDir(schemaDir);
  ensureDir(validatorDir);
  ensureDir(typesDir);
  ensureDir(DB_DIR);
  ensureDir(API_DIR);
  ensureDir(FORMS_DIR);

  console.log("⚙️ Generating validation + repos + routers + forms + openapi...");

  for (const model of models) {
    const schemaFile = path.join(schemaDir, `${model.name}.schema.ts`);
    const validatorFile = path.join(
      validatorDir,
      `${model.name}.validator.ts`
    );
    const typeFile = path.join(typesDir, `${model.name}.types.ts`);
    const repoFile = path.join(DB_DIR, `${model.name}Repository.ts`);
    const routerFile = path.join(API_DIR, `${toCamel(model.name)}.ts`);
    const formFile = path.join(FORMS_DIR, `${model.name}Form.ts`);

    writeGeneratedFile(schemaFile, generateSchema(model, enums, modelNames));
    writeGeneratedFile(validatorFile, generateValidator(model));
    writeGeneratedFile(typeFile, generateType(model));
    writeGeneratedFile(repoFile, generateRepository(model));
    writeGeneratedFile(routerFile, generateRouter(model));
    writeGeneratedFile(formFile, generateForm(model));
    generateOpenApiComponent(model);

    console.log(`  ✔ ${model.name}`);
  }

  generateEnumsFile(enums);

  generateIndexFile(schemaDir, ".schema.ts", ".schema");
  generateIndexFile(validatorDir, ".validator.ts", ".validator");
  generateIndexFile(typesDir, ".types.ts", ".types");

  console.log("✨ Running Prettier (if available)...");
  runPrettier();

  console.log("🎉 Generation complete!\n");
}

function main() {
  generateAll();

  if (WATCH) {
    console.log("👀 Watching prisma/schema.prisma for changes...");
    fs.watchFile(PRISMA_SCHEMA, { interval: 500 }, () => {
      console.log("\n♻️  Detected schema change, regenerating...");
      generateAll();
    });
  }
}

main();
