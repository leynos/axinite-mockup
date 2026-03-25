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
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${url} with ${response.status}`);
  }

  return (await response.json()) as T;
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

    if (
      typeof payload === "object" &&
      payload !== null &&
      "flags" in payload &&
      typeof payload.flags === "object" &&
      payload.flags !== null
    ) {
      return payload.flags;
    }

    return payload as Record<string, boolean>;
  } catch {
    return {};
  }
}
