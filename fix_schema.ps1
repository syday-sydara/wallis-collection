$schemaPath = 'prisma/schema.prisma'
$lines = @(Get-Content $schemaPath)
$newLines = @()

for ($i = 0; $i -lt $lines.Count; $i++) {
    $newLines += $lines[$i]
    if ($lines[$i] -match 'model AuditLog' -and $i + 15 -lt $lines.Count) {
        # Find the closing brace
        for ($j = $i; $j -lt $lines.Count; $j++) {
            if ($lines[$j] -match '^\}' -and $j -gt $i + 5) {
                # Insert userId and user fields before the closing brace
                $newLines += '  userId    String?'
                $newLines += '  user      User?     @relation("UserAuditLogs", fields: [userId], references: [id])'
                break
            }
            if ($j -gt $i) {
                $newLines += $lines[$j]
            }
        }
        $i = $j
    }
}

$newLines | Set-Content $schemaPath
