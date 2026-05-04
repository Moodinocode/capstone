# Build the LaTeX report.
#
# Usage:
#   make            -> figures + report.pdf
#   make figures    -> render all mermaid sources to PNG (requires mmdc)
#   make pdf        -> compile pdflatex twice for refs
#   make clean      -> remove aux files

PDFLATEX ?= pdflatex
MAIN     ?= main
OUT      ?= report.pdf

.PHONY: all pdf figures clean

all: figures pdf

figures:
	pwsh -File figures/render-figures.ps1

pdf:
	$(PDFLATEX) -interaction=nonstopmode $(MAIN).tex
	$(PDFLATEX) -interaction=nonstopmode $(MAIN).tex
	@if [ -f $(MAIN).pdf ]; then mv -f $(MAIN).pdf $(OUT); fi

clean:
	@rm -f *.aux *.log *.out *.toc *.lof *.lot *.fls *.fdb_latexmk
	@echo "cleaned aux files"
