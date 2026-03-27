// scripts/setup.ts
import { execSync } from "node:child_process";
import fs from "node:fs";

function run(cmd: string, label?: string) {
  try {
    if (label) console.log(`\n🔧 ${label}`);
    console.log(`> ${cmd}`);
    execSync(cmd, { stdio: "inherit" });
  } catch (err) {
    console.error(`❌ Failed: ${cmd}`);
    process.exit(1);
  }
}

function checkEnv() {
  console.log("\n🔍 Validating environment variables...");

  const required = [
    "DATABASE_URL",
    "NEXT_PUBLIC_URL",
    "PAYSTACK_SECRET_KEY",
    "MONNIFY_AUTH",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS"
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.warn(
      `⚠️  Missing environment variables:\n${missing
        .map((m) => ` - ${m}`)
        .join("\n")}`
    );
    console.warn("Setup will continue, but some features may not work.");
  } else {
    console.log("✅ All required environment variables are set.");
  }
}

function ensureEnvFile() {
  if (!fs.existsSync(".env")) {
    console.log("⚠️  No .env file found. Creating one from .env.example...");
    if (fs.existsSync(".env.example")) {
      fs.copyFileSync(".env.example", ".env");
      console.log("📄 Created .env from .env.example");
    } else {
      console.warn("⚠️  No .env.example found. Skipping.");
    }
  }
}

async function main() {
  console.log("🚀 Starting Wallis Collection setup...");

  ensureEnvFile();
  checkEnv();

  run("pnpm install", "Installing dependencies");
  run("pnpm prisma:generate", "Generating Prisma client");
  run("pnpm prisma:migrate", "Running Prisma migrations");

  console.log("\n✨ Setup complete! Your environment is ready.");
  console.log("➡️  Run `pnpm dev` to start the development server.\n");
}

main();
