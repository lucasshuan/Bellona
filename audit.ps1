$files = Get-ChildItem -Path "apps/web/src" -Recurse -File
$results1 = $files | Select-String -Pattern "#[0-9a-fA-F]{3,8}|rgb\(|hsl\(|\[(#|rgb|hsl)"
"--- Hardcoded Colors ---"
$results1 | Group-Object Path | Select-Object @{N='File';E={$_.Name.Replace($PWD.Path + '\', '')}}, Count | Format-Table -AutoSize
$results2 = $files | Select-String -Pattern "(red|green|yellow|emerald|blue|orange|purple|pink)-(50|100|200|300|400|500|600|700|800|900)"
"--- Palette Literals ---"
$results2 | Group-Object Path | Select-Object @{N='File';E={$_.Name.Replace($PWD.Path + '\', '')}}, Count | Format-Table -AutoSize
$results3 = $files | Select-String -Pattern "focus:ring-primary/10 w-full rounded-2xl border bg-white/5"
"--- Duplicated Utility 1 ---"
$results3 | Group-Object Path | Select-Object @{N='File';E={$_.Name.Replace($PWD.Path + '\', '')}}, Count | Format-Table -AutoSize
$files2 = Get-ChildItem -Path "apps/web/src/components", "apps/web/src/app" -Recurse -File -ErrorAction SilentlyContinue
$results4 = $files2 | Select-String -Pattern "border-white/10 bg-white/5"
"--- Duplicated Utility 2 ---"
$results4 | Group-Object Path | Select-Object @{N='File';E={$_.Name.Replace($PWD.Path + '\', '')}}, Count | Format-Table -AutoSize
