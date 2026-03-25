import { describe, expect, it } from "vitest";

import { resolveFeatureFlags } from "@/lib/feature-flags/runtime";

describe("feature flag resolution", () => {
  it("applies server values before defaults", () => {
    const resolved = resolveFeatureFlags({ route_jobs: false }, {});
    expect(resolved.route_jobs).toBe(false);
  });

  it("prefers local overrides over server values", () => {
    const resolved = resolveFeatureFlags(
      { route_jobs: false },
      { route_jobs: true }
    );
    expect(resolved.route_jobs).toBe(true);
  });
});
