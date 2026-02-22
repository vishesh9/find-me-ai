// Terminal log styling (ANSI codes; no-op if not a TTY)
const c = {
  dim: (s: string) => (process.stdout.isTTY ? `\x1b[90m${s}\x1b[0m` : s),
  green: (s: string) => (process.stdout.isTTY ? `\x1b[32m${s}\x1b[0m` : s),
  red: (s: string) => (process.stdout.isTTY ? `\x1b[31m${s}\x1b[0m` : s),
  yellow: (s: string) => (process.stdout.isTTY ? `\x1b[33m${s}\x1b[0m` : s),
  cyan: (s: string) => (process.stdout.isTTY ? `\x1b[36m${s}\x1b[0m` : s),
  bold: (s: string) => (process.stdout.isTTY ? `\x1b[1m${s}\x1b[0m` : s),
};

export const log = {
  server: (msg: string) => console.log(c.cyan("◆"), c.bold("Server:"), msg),
  start: (msg: string) => console.log(c.yellow("▶"), c.bold("Run:"), msg),
  step: (prompt: string, run: number, total: number) =>
    console.log(c.dim("  │"), c.cyan("◇"), c.dim(`Prompt "${prompt.slice(0, 40)}${prompt.length > 40 ? "…" : ""}"`), c.dim(`Run ${run}/${total}`)),
  success: (msg: string) => console.log(c.green("  ✓"), c.dim(msg)),
  error: (msg: string, err?: string) => console.error(c.red("  ✗"), c.red(msg), err ? c.dim(err) : ""),
  done: (msg: string) => console.log(c.green("✔"), c.bold(msg)),
  clear: (msg: string) => console.log(c.yellow("🗑"), c.bold("Clear:"), msg),
};
