Write-Host "Moving schemas and domain logic into packages/shared..."

# ------------------------------------------------------------
# 0. Resolve repo root (directory ABOVE /scripts)
# ------------------------------------------------------------
$scriptPath = $MyInvocation.MyCommand.Path
$scriptDir  = Split-Path $scriptPath -Parent
$root       = Split-Path $scriptDir -Parent

Write-Host "Repo root detected at: $root"

# ------------------------------------------------------------
# 1. Ensure shared folders exist
# ------------------------------------------------------------
New-Item -ItemType Directory -Force -Path "$root/packages/shared/src/schemas" | Out-Null
New-Item -ItemType Directory -Force -Path "$root/packages/shared/src/domain"  | Out-Null

# ------------------------------------------------------------
# 2. Move schemas from lib/schemas → shared/schemas
# ------------------------------------------------------------
$schemaFiles = @(
  "$root/lib/schemas/order.ts",
  "$root/lib/schemas/payment.ts",
  "$root/lib/schemas/product.ts",
  "$root/lib/schemas/reservation.ts"
)

foreach ($file in $schemaFiles) {
  if (Test-Path $file) {
    Move-Item -Path $file -Destination "$root/packages/shared/src/schemas" -Force
    Write-Host "Moved schema: $(Split-Path $file -Leaf)"
  } else {
    Write-Host "Missing schema: $file"
  }
}

# ------------------------------------------------------------
# 3. Move domain logic from workers → shared/domain
# ------------------------------------------------------------
$domainFiles = @(
  "$root/apps/workers/domain/order-state-machine.ts",
  "$root/apps/workers/domain/timeline.ts"
)

foreach ($file in $domainFiles) {
  if (Test-Path $file) {
    Move-Item -Path $file -Destination "$root/packages/shared/src/domain" -Force
    Write-Host "Moved domain: $(Split-Path $file -Leaf)"
  } else {
    Write-Host "Missing domain file: $file"
  }
}

# ------------------------------------------------------------
# 4. Remove old domain folder if empty
# ------------------------------------------------------------
$oldDomain = "$root/apps/workers/domain"

if (Test-Path $oldDomain) {
  if ((Get-ChildItem $oldDomain).Count -eq 0) {
    Remove-Item $oldDomain -Force
    Write-Host "Removed old empty domain folder"
  }
}

# ------------------------------------------------------------
# 5. Update imports in all .ts/.tsx files
# ------------------------------------------------------------
Write-Host "Updating imports..."

$allTsFiles = Get-ChildItem -Path $root -Recurse -Include *.ts, *.tsx

foreach ($file in $allTsFiles) {
  (Get-Content $file.PSPath) |
    ForEach-Object {
      $_ -replace "from\s+['""]lib/schemas", "from '@wallis/shared/schemas" `
         -replace "from\s+['""]\.\./domain", "from '@wallis/shared/domain" `
         -replace "from\s+['""]\.\./\.\./domain", "from '@wallis/shared/domain"
    } | Set-Content $file.PSPath
}

Write-Host "Migration complete."
Write-Host "Now run:"
Write-Host "  pnpm install"
Write-Host "  pnpm -r build"
