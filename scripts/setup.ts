#!/usr/bin/env tsx
import "dotenv/config";
import { Command } from "commander";
import chalk from "chalk";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import readline from "node:readline/promises";
import { z } from "zod";
import dotenv from "dotenv";
import ora from "ora";

const run = promisify(exec);

const log = {
  info: (msg: string) => console.log(chalk.blue("ℹ️  " + msg)),
  success: (msg: string) => console.log(chalk.green("✔️  " + msg)),
  warn: (msg: string) => console.log(chalk.yellow("⚠️  " + msg)),
  error: (msg: string) => console.log(chalk.red("❌ " + msg)),
};

const requiredEnv = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_URL: z.string().url(),
  PAYSTACK_SECRET_KEY: z.string().min(10),
  MONNIFY_AUTH: z.string().min(10),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().regex(/^\d+$/, "SMTP_PORT must be a number"),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
});

async function confirm(question: string) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = await rl.question(question);
  rl.close();
  return answer.toLowerCase().startsWith("y");
}

/**
 * SAFER ENV HANDLING:
 * - Never overwrites .env
 * - Never deletes .env
 * - Creates .env from .env.example only if missing
 * - Supports CI + force mode
 */
async function ensureEnvFile(opts: { force?: boolean; ci?: boolean }) {
  const hasEnv = fs.existsSync(".env");
  const hasEnc = fs.existsSync(".env.enc");
  const hasExample = fs.existsSync(".env.example");

  // 1. If .env exists, do nothing
  if (hasEnv) {
    log.info(".env already exists — leaving it untouched.");
    return;
  }

  // 2. If .env.enc exists, decrypt it
  if (hasEnc) {
    const key = process.env.ENV_KEY;
    if (!key) {
      log.error("ENV_KEY missing — cannot decrypt .env.enc");
      process.exit(1);
    }

    log.info("Decrypting .env.enc...");
    const { decryptEnv } = await import("./env-encryption");
    decryptEnv(key);
    log.success("Decrypted .env.enc → .env");
    return;
  }

  // 3. If no .env but .env.example exists, offer to create it
  if (hasExample) {
    log.warn("No .env file found.");

    if (opts.force || opts.ci) {
      fs.copyFileSync(".env.example", ".env");
      log.success("Created .env from .env.example (forced/CI mode)");
      return;
    }

    const shouldCreate = await confirm("Create .env from .env.example? (y/N) ");
    if (shouldCreate) {
      fs.copyFileSync(".env.example", ".env");
      log.success("Created .env from .env.example");
    } else {
      log.warn("Skipping .env creation — some features may not work.");
    }

    return;
  }

  // 4. No .env, no .env.enc, no .env.example
  log.warn("No .env, .env.enc, or .env.example found. Skipping env setup.");
}

function validateEnv() {
  log.info("Validating environment variables...");

  const result = requiredEnv.safeParse(process.env);

  if (!result.success) {
    log.warn("Some environment variables are missing or invalid:");
    for (const issue of result.error.issues) {
      console.log(" - " + issue.path.join(".") + ": " + issue.message);
    }
    log.warn("Setup will continue, but some features may not work.");
  } else {
    log.success("All required environment variables are valid.");
  }
}

async function runCommand(cmd: string, label: string) {
  const spinner = ora(label).start();
  try {
    const { stdout, stderr } = await run(cmd);
    spinner.succeed();

    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
  } catch (err: any) {
    spinner.fail();
    log.error(`Command failed: ${cmd}`);
    if (err.stderr) process.stderr.write(err.stderr);
    process.exit(1);
  }
}

async function main() {
  const program = new Command();

  program
    .name("wallis-setup")
    .description("Setup CLI for Wallis Collection project")
    .option("--skip-install", "Skip dependency installation")
    .option("--skip-migrate", "Skip Prisma migrations")
    .option("--force", "Run without confirmation prompts")
    .option("--ci", "Run in CI mode (non-interactive)")
    .parse(process.argv);

  const opts = program.opts();

  console.log(chalk.magenta("\n🚀 Starting Wallis Collection setup...\n"));

  // SAFER ENV + ENCRYPTION HANDLING
  await ensureEnvFile(opts);

  // Reload env after creating/decrypting .env
  dotenv.config();

  // Validate environment
  validateEnv();

  // Install dependencies
  if (!opts.skipInstall) {
    await runCommand("pnpm install", "Installing dependencies");
  } else {
    log.warn("Skipping dependency installation");
  }

  // Generate Prisma client
  await runCommand("pnpm prisma:generate", "Generating Prisma client");

  // Run migrations
  if (!opts.skipMigrate) {
    const shouldMigrate =
      opts.force || opts.ci || (await confirm("Run Prisma migrations? (y/N) "));

    if (shouldMigrate) {
      await runCommand("pnpm prisma:migrate", "Running Prisma migrations");
    } else {
      log.warn("Skipping Prisma migrations");
    }
  }

  console.log(chalk.green("\n✨ Setup complete! Your environment is ready."));
  console.log(chalk.blue("➡️  Run `pnpm dev` to start the development server.\n"));
}

main();
