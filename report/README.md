# Spotlight — Capstone Report

LaTeX source for the capstone report.

## Build

Prereqs (one-time):

```powershell
# 1. LaTeX
winget install MiKTeX.MiKTeX

# 2. Mermaid renderer — CHOOSE ONE
#   (a) mermaid-cli (simplest, no MCP needed):
npm i -g @mermaid-js/mermaid-cli
#   (b) mermaid MCP (lets the assistant render directly):
claude mcp add mermaid -- npx -y mcp-mermaid
```

Then:

```powershell
# Render figures (.mmd -> .png)
pwsh report/figures/render-figures.ps1

# Build the PDF
cd report
pdflatex -interaction=nonstopmode main.tex
pdflatex -interaction=nonstopmode main.tex
# main.pdf is the report
```

Or, on a Unix-like shell:

```bash
cd report
make
```

## Title-page placeholders

Open `main.tex` and replace:

- `[Author Name]`
- `[University Name]`
- `[Instructor Name]`
- `[Course Code]`

with the real values before submission.

## Files

```
report/
├── main.tex                 # entrypoint, preamble, title page
├── Makefile                 # build helper
├── README.md                # this file
├── sections/
│   ├── 01-abstract.tex
│   ├── 02-introduction.tex
│   ├── 03-background.tex
│   ├── 04-requirements.tex
│   ├── 05-architecture.tex
│   ├── 06-data-model.tex
│   ├── 07-detailed-design.tex
│   ├── 08-implementation.tex
│   ├── 09-non-functional.tex
│   ├── 10-testing.tex
│   ├── 11-deployment.tex
│   ├── 12-future-work.tex
│   ├── 13-conclusion.tex
│   ├── 14-references.tex
│   ├── 15-appendix-schema.tex
│   └── 16-appendix-api.tex
└── figures/
    ├── *.mmd                # mermaid source (12 figures)
    ├── *.png                # rendered (after running render-figures.ps1)
    └── render-figures.ps1
```
