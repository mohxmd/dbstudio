import { writeFileSync, unlinkSync, existsSync } from "fs";
import { tmpdir, homedir } from "os";
import { join } from "path";
import type { Dialect } from "./dialect";

// Temp file registry

const tempFiles: string[] = [];

/** Remove all temporary files created by this process. */
export function cleanupAll() {
  for (const f of tempFiles) {
    if (existsSync(f)) unlinkSync(f);
  }
}

/** Write content to a uniquely named file in the OS temp directory. */
function writeTempFile(name: string, content: string): string {
  const path = join(tmpdir(), `${name}-${Date.now()}`);
  writeFileSync(path, content, "utf8");
  tempFiles.push(path);
  return path;
}

// Drizzle config

/** Build a minimal drizzle.config.ts string for the provided database URL. */
function generateDrizzleConfig(url: string, dialect: Dialect): string {
  if (dialect === "sqlite") {
    const filePath = url
      .replace(/^sqlite:\/\//, "")
      .replace(/^sqlite:/, "")
      .replace(/^file:\/\//, "")
      .replace(/^file:/, "");
    return `export default {
  dialect: "sqlite",
  dbCredentials: { url: "${filePath}" },
};`;
  }

  return `export default {
  dialect: "${dialect}",
  dbCredentials: { url: "${url}" },
};`;
}

/** Create a temp drizzle config file and return its path. */
export function createDrizzleConfig(url: string, dialect: Dialect): string {
  return writeTempFile("dbstudio.config.ts", generateDrizzleConfig(url, dialect));
}

// Cloudflare tunnel config

/** Build a temporary cloudflared config for a named tunnel run. */
function generateTunnelConfig(tunnelName: string, hostname: string, port: string): string {
  const credPath = join(homedir(), ".cloudflared");
  return `tunnel: ${tunnelName}
credentials-file: ${credPath}/${tunnelName}.json

ingress:
  - hostname: ${hostname}
    service: http://localhost:${port}
  - service: http_status:404
`;
}

/** Create a temp cloudflared config file for a named tunnel and return its path. */
export function createTunnelConfig(tunnelName: string, hostname: string, port: string): string {
  return writeTempFile("dbstudio-tunnel.yml", generateTunnelConfig(tunnelName, hostname, port));
}
