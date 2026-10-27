#!/usr/bin/env node
// Reads the hook payload from stdin and appends a summary line to ~/.claude/hook-logger.log.
// It never blocks or modifies the event: it always exits 0 and prints nothing to stdout.

const fs = require("fs");
const os = require("os");
const path = require("path");

const LOG_FILE = path.join(os.homedir(), ".claude", "hook-logger.log");
const PREVIEW_CHARS = 200;

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (raw += chunk));
process.stdin.on("end", () => {
  try {
    const event = JSON.parse(raw || "{}");
    const entry = {
      time: new Date().toISOString(),
      event: event.hook_event_name,
      session: event.session_id,
      cwd: event.cwd,
      tool: event.tool_name,
      // Truncated so the log never holds whole files or long prompts.
      input: preview(event.tool_input ?? event.prompt),
      pid: process.pid,
      user: os.userInfo().username,
    };
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n");
  } catch (err) {
    process.stderr.write(`hook-logger: ${err.message}\n`);
  }
  process.exit(0);
});

function preview(value) {
  if (value === undefined) return undefined;
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > PREVIEW_CHARS ? text.slice(0, PREVIEW_CHARS) + "…" : text;
}
