export const HELP = `
dbstudio — spin up Drizzle Studio from any database URL

Usage:
  dbstudio <database-url> [options]

Examples:
  dbstudio postgresql://user:pass@localhost:5432/mydb
  dbstudio mysql://user:pass@localhost:3306/mydb
  dbstudio sqlite:./local.db

  # Quick share (no CF account needed, temporary URL)
  dbstudio postgresql://... --share

  # Named tunnel (persistent URL, needs CF account + domain)
  dbstudio postgresql://... --share --tunnel dbstudio --hostname db.yourteam.com

Options:
  --port <number>        Port to run studio on (default: 4983)
  --host <string>        Host to bind to (default: 127.0.0.1, or 0.0.0.0 with --share)
  --open                 Auto-open in browser
  --share                Expose via Cloudflare Tunnel
  --tunnel <name>        Named CF tunnel (requires --hostname)
  --hostname <domain>    Public hostname for named tunnel
  -h, --help             Show this help
  -v, --version          Show version

Tunnel setup (one time):
  yay -S cloudflared
  cloudflared tunnel login
  cloudflared tunnel create <name>
  # add CNAME in Cloudflare dashboard → <tunnel-id>.cfargotunnel.com
`;
