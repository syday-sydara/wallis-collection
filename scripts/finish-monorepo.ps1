Write-Host "🚀 Finishing Wallis Collection monorepo migration..."

# ------------------------------------------------------------
# 1. Ensure monorepo folders exist
# ------------------------------------------------------------
New-Item -ItemType Directory -Force -Path "apps" | Out-Null
New-Item -ItemType Directory -Force -Path "apps/workers" | Out-Null
New-Item -ItemType Directory -Force -Path "packages/shared/src/schemas" | Out-Null
New-Item -ItemType Directory -Force -Path "packages/shared/src/types"   | Out-Null
New-Item -ItemType Directory -Force -Path "packages/shared/src/domain"  | Out-Null
New-Item -ItemType Directory -Force -Path "packages/shared/src/events"  | Out-Null

# ------------------------------------------------------------
# 2. Move backend workers (root src/) → apps/workers/src
# ------------------------------------------------------------
if (Test-Path "src") {
    New-Item -ItemType Directory -Force -Path "apps/workers/src" | Out-Null
    Move-Item -Path "src/*" -Destination "apps/workers/src" -Force
    Remove-Item "src" -Force
    Write-Host "✔ Moved backend src/ → apps/workers/src/"
} else {
    Write-Host "⚠️ No src/ folder found at root (maybe already moved?)"
}

# ------------------------------------------------------------
# 3. Create root workspace configs
# ------------------------------------------------------------
@"
packages:
  - "apps/*"
  - "packages/*"
"@ | Set-Content "pnpm-workspace.yaml"

@"
{
  "name": "wallis-collection",
  "private": true,
  "version": "1.0.0",
  "workspaces": ["apps/*", "packages/*"],
  "engines": { "node": ">=18", "pnpm": ">=8" }
}
"@ | Set-Content "package.json"

@"
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "noUncheckedIndexedAccess": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "importsNotUsedAsValues": "error",
    "types": ["node"],
    "lib": ["ES2022"]
  }
}
"@ | Set-Content "tsconfig.base.json"

@"
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@wallis/shared/*": ["packages/shared/src/*"]
    }
  }
}
"@ | Set-Content "tsconfig.json"

# ------------------------------------------------------------
# 4. Create shared package configs
# ------------------------------------------------------------
@"
{
  "name": "@wallis/shared",
  "version": "1.0.0",
  "private": false,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json"
  },
  "dependencies": {
    "zod": "^4.4.3"
  }
}
"@ | Set-Content "packages/shared/package.json"

@"
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist"
  },
  "include": ["src"]
}
"@ | Set-Content "packages/shared/tsconfig.json"

@"
export * from "./schemas";
export * from "./types";
export * from "./domain";
export * from "./events";
"@ | Set-Content "packages/shared/src/index.ts"

# ------------------------------------------------------------
# 5. Create workers package configs
# ------------------------------------------------------------
@"
{
  "name": "wallis-collection-workers",
  "version": "1.0.0",
  "private": true,
  "type": "commonjs",
  "main": "dist/index.js",
  "scripts": {
    "dev": "nodemon --watch src --ext ts --exec ts-node -r tsconfig-paths/register src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@prisma/client": "^5.12.0",
    "bullmq": "^5.0.0",
    "dotenv": "^16.4.0",
    "express": "^5.2.1",
    "ioredis": "^5.4.1",
    "prom-client": "^15.1.3",
    "zod": "^4.4.3",
    "@wallis/shared": "1.0.0"
  },
  "devDependencies": {
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.4.0",
    "nodemon": "^3.0.3"
  }
}
"@ | Set-Content "apps/workers/package.json"

@"
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "baseUrl": "src",
    "paths": {
      "@config/*": ["config/*"],
      "@queues/*": ["queues/*"],
      "@workers/*": ["workers/*"],
      "@services/*": ["services/*"],
      "@producers/*": ["producers/*"],
      "@providers/*": ["providers/*"],
      "@events/*": ["events/*"],
      "@domain/*": ["domain/*"],
      "@wallis/shared/*": ["../../packages/shared/src/*"]
    },
    "resolveJsonModule": true,
    "sourceMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
"@ | Set-Content "apps/workers/tsconfig.json"

Write-Host "`n✨ Migration complete!"
Write-Host "👉 Now run:"
Write-Host "   pnpm install"
Write-Host "   pnpm -r build"
Write-Host "   pnpm --filter wallis-collection-workers dev"