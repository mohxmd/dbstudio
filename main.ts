#!/usr/bin/env bun

import { HELP } from "./lib/constants/help";
import { parseStudioOptions } from "./lib/utils/args";
import { runStudioCommand } from "./lib/commands/studio";

const args = process.argv.slice(2);

if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
  console.log(HELP);
  process.exit(0);
}

if (args.includes("-v") || args.includes("--version")) {
  const pkg = await Bun.file(
    new URL("../package.json", import.meta.url),
  ).json();
  console.log(`dbstudio v${pkg.version}`);
  process.exit(0);
}

try {
  const options = parseStudioOptions(args);
  const code = await runStudioCommand(options);
  process.exit(code);
} catch (error) {
  const msg = error instanceof Error ? error.message : String(error);

  if (msg.startsWith("Please provide")) {
    console.error(`❌ ${msg}`);
    console.error("   Run dbstudio --help for usage.");
  } else if (msg.startsWith("Could not detect")) {
    console.error(`❌ ${msg}`);
  } else if (msg.startsWith("--tunnel requires")) {
    console.error(`❌ ${msg}`);
  } else {
    console.error(`❌ Unexpected error: ${msg}`);
  }

  process.exit(1);
}
