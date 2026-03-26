const apiPort = Number(process.env.MOCK_API_PORT ?? "8787");
const previewPort = Number(process.env.PREVIEW_PORT ?? "2020");

type ManagedProcess = {
  label: string;
  process: Bun.Subprocess;
};

function pipeOutput(
  label: string,
  stream: ReadableStream<Uint8Array> | null,
  writer: (line: string) => void
): void {
  if (!stream) {
    return;
  }

  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let pending = "";

  void (async () => {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (pending.length > 0) {
          writer(`[${label}] ${pending}`);
        }
        break;
      }

      pending += decoder.decode(value, { stream: true });
      const lines = pending.split(/\r?\n/);
      pending = lines.pop() ?? "";
      for (const line of lines) {
        writer(`[${label}] ${line}`);
      }
    }
  })();
}

function spawnManaged(
  label: string,
  cmd: string[],
  env: NodeJS.ProcessEnv = process.env
): ManagedProcess {
  const child = Bun.spawn(cmd, {
    cwd: process.cwd(),
    env,
    stdout: "pipe",
    stderr: "pipe",
  });

  pipeOutput(label, child.stdout, console.log);
  pipeOutput(label, child.stderr, console.error);

  return { label, process: child };
}

async function main(): Promise<void> {
  console.log(
    `[dev] starting mock API on ${apiPort}, static preview on ${previewPort}`
  );

  const managed = [
    spawnManaged("mock-api", ["bun", "mock-backend/src/server.ts"], {
      ...process.env,
      MOCK_API_PORT: String(apiPort),
    }),
    spawnManaged("build", ["bunx", "vite", "build", "--watch"]),
    spawnManaged("preview", ["bun", "mock-backend/src/preview-server.ts"], {
      ...process.env,
      MOCK_API_PORT: String(apiPort),
      PREVIEW_PORT: String(previewPort),
    }),
  ];

  let shuttingDown = false;

  const stopAll = async (signal: string) => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    console.log(`[dev] received ${signal}, shutting down child processes`);
    for (const child of managed) {
      child.process.kill();
    }
    await Promise.allSettled(managed.map((child) => child.process.exited));
    process.exit(0);
  };

  process.on("SIGINT", () => {
    void stopAll("SIGINT");
  });
  process.on("SIGTERM", () => {
    void stopAll("SIGTERM");
  });

  const results = await Promise.race(
    managed.map(async (child) => ({
      label: child.label,
      exitCode: await child.process.exited,
    }))
  );

  if (!shuttingDown) {
    console.error(
      `[dev] ${results.label} exited unexpectedly with code ${results.exitCode}`
    );
    await stopAll("child-exit");
  }
}

await main();

export {};
