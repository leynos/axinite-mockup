NODE := node
NPM := npm
MDLINT ?= markdownlint-cli2
MDLINT_FALLBACK := $(HOME)/.bun/bin/markdownlint-cli2
ifneq ($(wildcard $(MDLINT_FALLBACK)),)
  ifneq ($(shell command -v $(MDLINT) >/dev/null 2>&1; echo $$?),0)
    MDLINT := $(MDLINT_FALLBACK)
  endif
endif
NIXIE ?= nixie

.PHONY: all clean check-fmt lint test dev markdownlint nixie

all: lint test

clean:
	rm -rf dist

check-fmt:
	$(NODE) scripts/check-format.mjs

lint:
	$(MAKE) check-fmt
	$(NODE) scripts/lint-site.mjs
	$(NODE) --check scripts/build-site.mjs
	$(NODE) --check scripts/lint-site.mjs
	$(NODE) --check scripts/test-build.mjs

test:
	$(NPM) run build
	$(NODE) scripts/test-build.mjs

markdownlint:
	$(MDLINT) '**/*.md'

nixie:
	$(NIXIE) --no-sandbox

dev:
	caddy file-server --browse --listen :2020
