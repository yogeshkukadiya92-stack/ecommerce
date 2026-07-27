const MEMORY_LOG_INTERVAL_MS = 15 * 60 * 1000;

const runtimeState = globalThis as typeof globalThis & {
  memoryTelemetryStarted?: boolean;
};

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || runtimeState.memoryTelemetryStarted) {
    return;
  }

  runtimeState.memoryTelemetryStarted = true;

  const reportMemory = () => {
    const usage = process.memoryUsage();

    console.info("runtime_memory", {
      arrayBuffersMB: toMegabytes(usage.arrayBuffers),
      externalMB: toMegabytes(usage.external),
      heapTotalMB: toMegabytes(usage.heapTotal),
      heapUsedMB: toMegabytes(usage.heapUsed),
      rssMB: toMegabytes(usage.rss)
    });
  };

  reportMemory();
  setInterval(reportMemory, MEMORY_LOG_INTERVAL_MS).unref();
}

function toMegabytes(bytes: number) {
  return Math.round(bytes / 1024 / 1024);
}
