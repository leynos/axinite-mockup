NODE := node
NPM := npm

.PHONY: check-fmt lint test dev

check-fmt:
	$(NODE) scripts/check-format.mjs

lint:
	$(NODE) scripts/lint-site.mjs
	$(NODE) --check scripts/check-format.mjs
	$(NODE) --check scripts/lint-site.mjs
	$(NODE) --check scripts/test-build.mjs

test:
	$(NPM) run build
	$(NODE) scripts/test-build.mjs

dev:
	caddy file-server --browse --listen :2020
