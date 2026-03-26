export type StudioOptions = {
  dbUrl: string;
  port: string;
  host: string;
  shouldOpen: boolean;
  shouldShare: boolean;
  tunnelName: string | null;
  publicHostname: string | null;
};

/** Read a flag value in the form `--flag <value>`. */
function getFlag(args: string[], flag: string): string | null {
  const idx = args.indexOf(flag);
  if (idx === -1) return null;
  const val = args[idx + 1];
  return val && !val.startsWith("--") ? val : null;
}

/** Parse and validate CLI arguments into studio runtime options. */
export function parseStudioOptions(args: string[]): StudioOptions {
  const dbUrl = args[0];

  if (!dbUrl || dbUrl.startsWith("--")) {
    throw new Error("Please provide a database URL as the first argument.");
  }

  const shouldShare = args.includes("--share");
  const tunnelName = getFlag(args, "--tunnel");
  const publicHostname = getFlag(args, "--hostname");

  if (tunnelName && !publicHostname) {
    throw new Error(
      "--tunnel requires --hostname <your-domain>\n   Example: --tunnel dbstudio --hostname db.yourteam.com",
    );
  }

  // when sharing, bind to all interfaces so cloudflared can reach studio
  const explicitHost = getFlag(args, "--host");
  const host = explicitHost ?? (shouldShare ? "0.0.0.0" : "127.0.0.1");

  return {
    dbUrl,
    port: getFlag(args, "--port") ?? "4983",
    host,
    shouldOpen: args.includes("--open"),
    shouldShare,
    tunnelName,
    publicHostname,
  };
}
