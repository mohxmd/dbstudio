import type { StudioOptions } from "../utils/args";
import { detectDialect } from "../utils/dialect";
import { createDrizzleConfig, cleanupAll } from "../utils/config";
import { launchTunnel } from "./tunnel";
import type { ChildProcess } from "child_process";

const procs: ChildProcess[] = [];

function killAll() {
  for (const p of procs) {
    if (!p.killed) p.kill("SIGTERM");
  }
}

function registerCleanup() {
  process.on("exit", cleanupAll);
  process.on("SIGINT", () => {
    console.log("\n\n👋 Shutting down dbstudio...");
    killAll();
    cleanupAll();
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    killAll();
    cleanupAll();
    process.exit(0);
  });
}

export async function runStudioCommand(options: StudioOptions): Promise<number> {
  const { dbUrl, port, host, shouldOpen, shouldShare, tunnelName, publicHostname } = options;

  const dialect       = detectDialect(dbUrl);
  const drizzleConfig = createDrizzleConfig(dbUrl, dialect);
  const safeUrl       = dbUrl.replace(/:\/\/.*@/, "://<credentials>@");

  registerCleanup();

  // Print startup info

  console.log(`\n🚀 dbstudio`);
  console.log(`   Dialect : ${dialect}`);
  console.log(`   URL     : ${safeUrl}`);
  console.log(`   Studio  : https://local.drizzle.studio`);

  if (shouldShare && !tunnelName) {
    console.log(`   Tunnel  : starting... public URL coming shortly`);
  }
  if (tunnelName && publicHostname) {
    console.log(`   Tunnel  : https://${publicHostname}`);
  }
  console.log();

  // Spawn drizzle-kit studio via bunx
  // bunx is used so the binary works after `bun build --compile`
  // without needing a local node_modules at runtime

  const studioArgs = [
    "drizzle-kit",
    "studio",
    `--config=${drizzleConfig}`,
    `--port=${port}`,
    `--host=${host}`,
  ];

  if (shouldOpen && !shouldShare) studioArgs.push("--open");

  const studio = Bun.spawn(["bunx", ...studioArgs], {
    stdin:  "ignore",
    stdout: "inherit",
    stderr: "inherit",
  });

  // Launch tunnel after studio boots

  if (shouldShare) {
    // give drizzle-kit studio a moment to start before tunnel connects
    await Bun.sleep(2000);

    const tunnel = launchTunnel({ port, tunnelName, publicHostname, shouldOpen });
    // cast needed since launchTunnel returns node ChildProcess
    procs.push(tunnel as unknown as ChildProcess);

    if (shouldOpen && tunnelName && publicHostname) {
      spawn("xdg-open", [`https://${publicHostname}`], { stdio: "ignore" });
    }
  }

  // Wait for studio to exit

  const exitCode = await studio.exited;
  killAll();
  cleanupAll();
  return exitCode ?? 0;
}

// node spawn needed for tunnel (pipe stdio support)
import { spawn } from "child_process";
