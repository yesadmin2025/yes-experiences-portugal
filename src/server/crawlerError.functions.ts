import { createServerFn } from "@tanstack/react-start";
import { promises as fs } from "fs";

export type CrawlerErrorInfo = {
  found: boolean;
  message: string | null;
  file: string | null;
  line: number | null;
  column: number | null;
  source: string | null;
  capturedAt: string;
  raw: string | null;
};

const LOG_PATHS = [
  "/tmp/dev-server-logs/dev-server.log",
];

// Strip ANSI color codes so regex matching is reliable.
function stripAnsi(s: string): string {
  return s.replace(/\x1b\[[0-9;]*m/g, "");
}

async function readLogTail(): Promise<string | null> {
  for (const p of LOG_PATHS) {
    try {
      const buf = await fs.readFile(p, "utf8");
      // Keep only the tail to avoid huge payloads.
      const tail = buf.length > 200_000 ? buf.slice(-200_000) : buf;
      return stripAnsi(tail);
    } catch {
      /* try next */
    }
  }
  return null;
}

export const getLastCrawlerError = createServerFn({ method: "GET" }).handler(
  async (): Promise<CrawlerErrorInfo> => {
    const log = await readLogTail();
    if (!log) {
      return {
        found: false,
        message: null,
        file: null,
        line: null,
        column: null,
        source: null,
        capturedAt: new Date().toISOString(),
        raw: null,
      };
    }

    const lines = log.split("\n");

    // Patterns that indicate a TanStack route crawler / Vite build error.
    const errorMarkers = [
      /router-generator-plugin/i,
      /start-router-plugin/i,
      /\[tanstack[^\]]*\]/i,
      /Crawling result not available/i,
      /Failed to (?:resolve|parse|crawl)/i,
      /Transform failed/i,
      /Pre-transform error/i,
      /\bSyntaxError\b/,
      /\berror TS\d+/,
      /\[plugin:[^\]]+\]/i,
    ];

    // File:line:col pattern (absolute or relative path ending in source ext).
    const fileLineRe =
      /([\/\\w.\-@]+\.(?:tsx?|jsx?|mts|cts|mjs|cjs))(?::(\d+))(?::(\d+))?/;

    let lastIdx = -1;
    let matchedSource: string | null = null;
    for (let i = lines.length - 1; i >= 0; i--) {
      const ln = lines[i];
      for (const re of errorMarkers) {
        if (re.test(ln)) {
          lastIdx = i;
          matchedSource = re.source;
          break;
        }
      }
      if (lastIdx !== -1) break;
    }

    if (lastIdx === -1) {
      return {
        found: false,
        message: null,
        file: null,
        line: null,
        column: null,
        source: null,
        capturedAt: new Date().toISOString(),
        raw: null,
      };
    }

    // Capture the error block: a few lines before for context, up to 25 after.
    const start = Math.max(0, lastIdx - 2);
    const end = Math.min(lines.length, lastIdx + 25);
    const block = lines.slice(start, end).join("\n").trim();

    // Search the block for first file:line[:col] reference.
    let file: string | null = null;
    let line: number | null = null;
    let column: number | null = null;
    const fileMatch = block.match(fileLineRe);
    if (fileMatch) {
      file = fileMatch[1];
      line = fileMatch[2] ? Number(fileMatch[2]) : null;
      column = fileMatch[3] ? Number(fileMatch[3]) : null;
      // Normalize absolute /dev-server/... paths to repo-relative.
      if (file.startsWith("/dev-server/")) {
        file = file.slice("/dev-server/".length);
      }
    }

    // Use the marker line as the human message.
    const message = lines[lastIdx].trim();

    return {
      found: true,
      message,
      file,
      line,
      column,
      source: matchedSource,
      capturedAt: new Date().toISOString(),
      raw: block,
    };
  },
);
