#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const PRISMA_SCHEMA = path.join(process.cwd(), "prisma/schema.prisma");
const VALIDATION_DIR = path.join(process.cwd(), "lib/validation");

const GENERATED_START = "// === AUTO-GENERATED START ===";
const GENERATED_END = "// === AUTO-GENERATED END ===";

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readSchema() {
  return fs.readFileSync(PRISMA_SCHEMA, "utf8");
}

function extractModels(schema) {
  const modelRegex = /model\s+(\w+)\s+{([^}]*)}/gms;
  const enumRegex = /enum\s+(\w+)\s+{([^}]*)}/gms;

  const models = [];
  const enums = {};

  let match;

  // Extract enums
  while ((match = enumRegex.exec(schema))) {
    const [, name, body] = match;
    enums[name] = body
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("//"));
  }

  // Extract models
  while ((match = modelRegex.exec(schema))) {
    const [, name, body] = match;

    const fields = body
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => {
        if (!l) return false;
        if (l.startsWith("//")) return false;
        if (l.startsWith("@@")) return false; // skip model-level attributes
        return true;
      })
      .map((line) => {
        const parts = line.split(/\s+/);

        const field = parts[0];
        const type = parts[1];

        // Skip relation-only lines
        if (!type) return null;

        return { field, type, raw: line };
      })
      .filter(Boolean);

    models.push({ name, fields });
  }

  return { models, enums };
}

function zodType(type, enums) {
  const clean = type.replace("?", "").replace("[]", "");

  if (enums[clean]) {
    return `z.enum([${enums[clean].map((v) => `"${v}"`).join(", ")}])`;
  }

  switch (clean) {
    case "String":
      return "z.string()";
    case "Int":
      return "z.number()";
    case "Float":
      return "z.number()";
    case "Boolean":
      return "z.boolean()";
    case "DateTime":
      return "z.date()";
    case "Json":
      return "z.any()";
    default:
      return "z.string()"; // fallback for relations
  }
}

function generateSchema(model, enums) {
  const fields = model.fields
    .map(({ field, type, raw }) => {
      const isOptional = raw.includes("?");
      const isArray = type.endsWith("[]");

      let base = zodType(type, enums);

      if (isArray) base = `z.array(${base})`;
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

export function validate${model.name}(input) {
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

function run() {
  console.log("🔍 Reading Prisma schema...");
  const schema = readSchema();

  console.log("📦 Extracting models & enums...");
  const { models, enums } = extractModels(schema);

  const schemaDir = path.join(VALIDATION_DIR, "schemas");
  const validatorDir = path.join(VALIDATION_DIR, "validators");
  const typesDir = path.join(VALIDATION_DIR, "types");

  ensureDir(schemaDir);
  ensureDir(validatorDir);
  ensureDir(typesDir);

  console.log("⚙️ Generating files...");

  for (const model of models) {
    const schemaFile = path.join(schemaDir, `${model.name}.schema.ts`);
    const validatorFile = path.join(
      validatorDir,
      `${model.name}.validator.ts`
    );
    const typeFile = path.join(typesDir, `${model.name}.types.ts`);

    writeGeneratedFile(schemaFile, generateSchema(model, enums));
    writeGeneratedFile(validatorFile, generateValidator(model));
    writeGeneratedFile(typeFile, generateType(model));

    console.log(`  ✔ ${model.name}`);
  }

  console.log("\n🎉 Validation generation complete!");
}

run();
