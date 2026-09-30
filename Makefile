MDLINT ?= markdownlint-cli2
NIXIE ?= nixie

# `make fmt` and `make check-fmt` call mdtablefix directly. `--git` selects the
# Markdown files Git tracks and `--include-untracked` adds the untracked files
# Git does not ignore, so a new document is formatted before it is staged.
# Both modes need mdtablefix 0.6.1 or later.
MDTABLEFIX ?= mdtablefix
MDTABLEFIX_SELECT = --git --include-untracked
MDTABLEFIX_RULES = --wrap --renumber --breaks --ellipsis --fences

.PHONY: all build clean fmt check-fmt lint typecheck test test-a11y test-e2e lint-ftl-vars semantic ff markdownlint nixie

all: check-fmt lint typecheck test

build:
	bun run build

clean:
	rm -rf dist test-results tmp playwright-report

fmt:
	bun run fmt
	$(MDTABLEFIX) --in-place $(MDTABLEFIX_SELECT) $(MDTABLEFIX_RULES)
	$(MDLINT) --fix "**/*.md"

check-fmt:
	bun run check:fmt
	$(MDTABLEFIX) --check $(MDTABLEFIX_SELECT) $(MDTABLEFIX_RULES)

lint:
	bun run lint

typecheck:
	bun run check:types

test:
	bun run test

test-a11y:
	bun run test:a11y

test-e2e:
	bun run test:e2e

lint-ftl-vars:
	bun run lint:ftl-vars

semantic:
	bun run semantic

ff:
	bun run verify:full

markdownlint:
	$(MDLINT) '**/*.md'

nixie:
	$(NIXIE) --no-sandbox
