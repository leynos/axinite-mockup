export type GatewayStatus = {
  label: string;
  detail: string;
};

type RuntimeFeatureResponse =
  | Record<string, boolean>
  | {
      flags?: Record<string, boolean>;
    };

async function requestJson<T>(url: string): Promise<T> {
  const timeoutMs = 5_000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed for ${url} with ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchGatewayStatus(): Promise<GatewayStatus> {
  try {
    const payload = await requestJson<{
      connected?: boolean;
      version?: string;
      status?: string;
    }>("/api/gateway/status");

    return {
      label: payload.connected ? "Connected" : "Preview",
      detail: payload.version ?? payload.status ?? "Backend status unavailable",
    };
  } catch {
    return {
      label: "Preview",
      detail: "Using local route fixtures and translated shell copy",
    };
  }
}

export async function fetchRuntimeFeatureFlags(): Promise<
  Record<string, boolean>
> {
  try {
    const payload = await requestJson<RuntimeFeatureResponse>("/api/features");

    const coerceFlags = (value: unknown): Record<string, boolean> => {
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return {};
      }

      return Object.entries(value).reduce<Record<string, boolean>>(
        (flags, [name, flagValue]) => {
          if (typeof flagValue === "boolean") {
            flags[name] = flagValue;
          }
          return flags;
        },
        {}
      );
    };

    if (typeof payload === "object" && payload !== null && "flags" in payload) {
      return coerceFlags(payload.flags);
    }

    return coerceFlags(payload);
  } catch {
    return {};
  }
}
