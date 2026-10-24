#!/usr/bin/env node
// PostToolUse hook: append one line per modified file.
// Reads the hook payload from stdin as JSON. Never blocks, never throws.

import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Anchor on CLAUDE_PROJECT_DIR; fall back to this file's own location
// (<project>/.claude/hooks/log-edits.mjs) if the variable is absent.
const projectDir =
  process.env.CLAUDE_PROJECT_DIR ||
  join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const LOG = join(projectDir, '.claude', 'logs', 'file-edits.log');

// Paths that must never be logged — the log is plain text and may be read later.
const SKIP = [/(^|[\/])\.env($|\.)/i, /(^|[\/])\.git([\/]|$)/i,
               /\.key$/i, /\.pem$/i, /\.secret$/i];

function main(raw) {
  const p = JSON.parse(raw);
  const file = p?.tool_input?.file_path ?? p?.tool_input?.notebook_path;
  if (!file) return;                       // nothing file-shaped in this payload
  if (SKIP.some((re) => re.test(file))) return;

  const rel = relative(projectDir, file);
  const shown = rel && !rel.startsWith('..' + sep) && rel !== '..' ? rel : file;

  mkdirSync(dirname(LOG), { recursive: true });
  appendFileSync(LOG, `${new Date().toISOString()}\t${p.tool_name ?? '?'}\t${shown}\n`);
}

let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => (buf += c));
process.stdin.on('end', () => {
  try { main(buf); } catch { /* a logging hook must never break the session */ }
  process.exit(0);
});
