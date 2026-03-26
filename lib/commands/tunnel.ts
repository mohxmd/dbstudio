import { spawn } from "child_process";
import { createTunnelConfig } from "../utils/config";

export function launchTunnel(options: {
  port: string;
  tunnelName: string | null;
  publicHostname: string | null;
  shouldOpen: boolean;
}) {
  const { port, tunnelName, publicHostname, shouldOpen } = options;

  let tunnelArgs: string[];

  if (tunnelName && publicHostname) {
    // named tunnel — generate temp config.yml, never touches ~/.cloudflared/config.yml
    const tunnelConfigPath = createTunnelConfig(
      tunnelName,
      publicHostname,
      port,
    );
    tunnelArgs = ["tunnel", "--config", tunnelConfigPath, "run", tunnelName];
  } else {
    // quick share — zero setup, temporary trycloudflare.com URL
    tunnelArgs = ["tunnel", "--url", `http://localhost:${port}`];
  }

  const tunnel = spawn("cloudflared", tunnelArgs, {
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
  });

  // cloudflared prints the public URL to stderr
  tunnel.stderr?.on("data", (data: Buffer) => {
    const line = data.toString();
    process.stderr.write(data);

    // quick share: extract and highlight the URL when cloudflared prints it
    if (!tunnelName) {
      const match = line.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
      if (match) {
        console.log(`\n✅ Public URL: ${match[0]}`);
        console.log(`   Share this link with your team\n`);
        if (shouldOpen) {
          spawn("xdg-open", [match[0]], { stdio: "ignore" });
        }
      }
    }
  });

  tunnel.on("error", (err) => {
    console.error(`\n❌ Failed to start cloudflared: ${err.message}`);
    console.error(`   Install it with: yay -S cloudflared`);
  });

  tunnel.on("exit", (code) => {
    if (code !== 0) console.error(`\n⚠️  Tunnel exited with code ${code}`);
  });

  return tunnel;
}
