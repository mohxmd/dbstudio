export type Dialect = "postgresql" | "mysql" | "sqlite";

/** Detect Drizzle dialect from a database URL or SQLite-style path. */
export function detectDialect(url: string): Dialect {
  if (url.startsWith("postgresql://") || url.startsWith("postgres://"))
    return "postgresql";
  if (url.startsWith("mysql://") || url.startsWith("mysql2://")) return "mysql";
  if (
    url.startsWith("sqlite:") ||
    url.startsWith("file:") ||
    url === ":memory:" ||
    url.endsWith(".db") ||
    url.endsWith(".sqlite")
  )
    return "sqlite";

  throw new Error(
    `Could not detect dialect from URL: ${url}\nSupported: postgresql://, mysql://, sqlite:, file:`,
  );
}
