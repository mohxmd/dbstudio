# dbstudio

> Spin up Drizzle Studio instantly from any database URL — no project setup needed.

## Install

### Global
```bash
npm i -g dbstudio
# or
bun add -g dbstudio
```

### Without installing
```bash
bunx dbstudio <url>
# or
bun x dbstudio <url>
```

### Standalone binaries
Download prebuilt binaries from GitHub Releases (Linux/macOS/Windows).

## Usage

```bash
# PostgreSQL
dbstudio postgresql://user:pass@localhost:5432/mydb

# MySQL
dbstudio mysql://user:pass@localhost:3306/mydb

# SQLite
dbstudio sqlite:./local.db

# Custom port
dbstudio postgresql://... --port 8080

# Auto-open browser
dbstudio postgresql://... --open

# Quick share with a temporary public URL
dbstudio postgresql://... --share

# Named tunnel with your hostname
dbstudio postgresql://... --share --tunnel dbstudio --hostname db.yourteam.com
```

## How it works

1. Detects dialect from your URL (postgresql / mysql / sqlite)
2. Writes a temporary `drizzle.config.ts` in your OS temp directory
3. Spins up `drizzle-kit studio`
4. Cleans up the temp file when the process exits (including Ctrl+C)

No project config directory. No project setup. Just pass a URL.

## Options

| Flag | Default | Description |
|------|---------|-------------|
| `--port` | `4983` | Port to run studio on |
| `--host` | `127.0.0.1` | Host to bind to (`0.0.0.0` is used automatically with `--share` unless explicitly set) |
| `--open` | false | Auto-open in browser |
| `--share` | false | Expose Studio through Cloudflare Tunnel |
| `--tunnel` | | Named Cloudflare tunnel (requires `--hostname`) |
| `--hostname` | | Public hostname for named tunnel |
| `--help` | | Show help |
| `--version` | | Show version |

## Requirements

- [Bun](https://bun.sh) >= 1.0
- `cloudflared` if you use `--share`

## License

MIT
