NODE := node
NPM := npm

.PHONY: all clean check-fmt lint test dev

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

dev:
	caddy file-server --browse --listen :2020
