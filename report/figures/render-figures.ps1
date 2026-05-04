# Render every .mmd in this folder to a same-named .png.
# Prefers @mermaid-js/mermaid-cli (mmdc); install once with:
#   npm i -g @mermaid-js/mermaid-cli
# Then run:
#   pwsh report/figures/render-figures.ps1
#
# If mermaid-mcp is installed and you'd rather use it, pass -UseMcp; the
# script will print the .mmd contents for you to feed to the MCP tool
# (the assistant in your editor can do this automatically).

param(
  [switch]$UseMcp
)

$here = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $here

$sources = Get-ChildItem -Filter *.mmd
if (-not $sources) { Write-Host "No .mmd sources found in $here"; exit 0 }

if ($UseMcp) {
  Write-Host "MCP mode: feed each block to your mermaid MCP tool, save the PNG next to the .mmd."
  foreach ($s in $sources) {
    Write-Host "`n=== $($s.Name) ==="
    Get-Content $s.FullName | Write-Host
  }
  exit 0
}

# CLI path
$mmdc = Get-Command mmdc -ErrorAction SilentlyContinue
if (-not $mmdc) {
  Write-Error "mmdc not found on PATH. Install with: npm i -g @mermaid-js/mermaid-cli"
  exit 1
}

foreach ($s in $sources) {
  $out = [IO.Path]::ChangeExtension($s.FullName, ".png")
  Write-Host "rendering $($s.Name) -> $(Split-Path $out -Leaf)"
  & mmdc -i $s.FullName -o $out -b transparent -t neutral -w 1600
  if ($LASTEXITCODE -ne 0) { Write-Error "failed on $($s.Name)"; exit $LASTEXITCODE }
}

Write-Host "`nAll figures rendered."
