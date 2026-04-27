#!/usr/bin/env node
/**
 * Resolve the line number of `jobs.<JOB_KEY>.name:` inside a GitHub
 * Actions workflow YAML file.
 *
 * Why this exists
 * ---------------
 * The PR-comment step in `required-check-enforcer.yml` deep-links to
 * the line that defines the required status-check context. We used to
 * use `grep -nE '^    name: '` for this, which has two failure modes:
 *
 *   - Matches the FIRST 4-space `name:` it sees, even if it belongs
 *     to a different job further down the file.
 *   - Silently falls back to a hard-coded line number when the file
 *     is restructured, sending reviewers to the wrong line with no
 *     warning.
 *
 * This helper instead walks the YAML structurally and refuses to
 * guess: if `jobs:`, the job key, or its `name:` field is missing,
 * it exits non-zero with a precise message so the workflow fails
 * loudly instead of producing a misleading link.
 *
 * Output
 * ------
 *   On success: writes one line to stdout — `<integer>\n` — the
 *   1-indexed line number of the job's `name:` field.
 *   On failure: writes a diagnostic to stderr and exits non-zero.
 *
 * Inputs (CLI args, in order)
 * ---------------------------
 *   1. workflow YAML path (relative to CWD or absolute)
 *   2. job key under `jobs:` (e.g. "homepage-structure")
 *
 * Exit codes
 * ----------
 *   0  Found — line number printed to stdout.
 *   1  Job's `name:` field not found (workflow drifted).
 *   2  Setup error — bad args, file missing, unparseable YAML shape.
 */

import { readFile } from "node:fs/promises";

function fail(code, msg) {
  process.stderr.write(`❌ ${msg}\n`);
  process.exit(code);
}

const [, , workflowPath, jobKey] = process.argv;

if (!workflowPath || !jobKey) {
  fail(2, "Usage: resolve-workflow-job-name-line.mjs <workflow-yaml-path> <job-key>");
}

let yamlText;
try {
  yamlText = await readFile(workflowPath, "utf8");
} catch (err) {
  fail(2, `Could not read ${workflowPath}: ${err.message}`);
}

/**
 * Walks the workflow file with the same minimal YAML grammar used in
 * `enforce-required-status-context.mjs` (kept in sync intentionally —
 * if you tighten one, tighten the other). Returns the 1-indexed line
 * number of the job's `name:` field, or throws with a precise reason.
 *
 * Grammar enforced:
 *
 *   jobs:                    ← column 0, optional comment after
 *     <jobKey>:              ← exactly 2-space indent
 *       name: <value>        ← exactly 4-space indent inside the job
 *
 * Anything else is rejected so authoring mistakes (e.g. tabs, wrong
 * indent, the job re-keyed as `jobs.homepage_structure`) surface as
 * a workflow failure with a clear message instead of a wrong link.
 */
function resolveNameLine(text, key) {
  const lines = text.split(/\r?\n/);

  const jobsIdx = lines.findIndex((l) => /^jobs\s*:\s*(#.*)?$/.test(l));
  if (jobsIdx < 0) {
    throw new Error(
      `\`jobs:\` block not found in ${workflowPath}. ` +
        `Expected a line starting with \`jobs:\` at column 0.`,
    );
  }

  // Scan forward for `  <key>:` at exactly 2-space indent. Bail if we
  // hit another top-level key (column-0 starting char) before finding it.
  const jobHeader = new RegExp(`^  ${key}\\s*:\\s*(#.*)?$`);
  let jobIdx = -1;
  for (let i = jobsIdx + 1; i < lines.length; i++) {
    if (jobHeader.test(lines[i])) {
      jobIdx = i;
      break;
    }
    if (/^[A-Za-z_]/.test(lines[i])) break; // hit a sibling top-level key
  }
  if (jobIdx < 0) {
    // Provide actionable context: list the job keys we DID find under
    // jobs:, so the failure message tells the operator exactly what to
    // change (rename the key here vs rename the search target there).
    const seenKeys = [];
    for (let i = jobsIdx + 1; i < lines.length; i++) {
      const m = /^  ([A-Za-z0-9_-]+)\s*:\s*(#.*)?$/.exec(lines[i]);
      if (m) seenKeys.push(m[1]);
      if (/^[A-Za-z_]/.test(lines[i])) break;
    }
    throw new Error(
      `Job key \`${key}\` not found under \`jobs:\` in ${workflowPath}.\n` +
        `Job keys present: ${
          seenKeys.length > 0 ? seenKeys.map((k) => `\`${k}\``).join(", ") : "(none)"
        }.\n` +
        `Either rename the job in the workflow back to \`${key}\`, or update\n` +
        `the WORKFLOW_JOB_KEY env var passed to the enforcer.`,
    );
  }

  // Scan inside the job block for `    name: …` at exactly 4-space
  // indent. Stop scanning when we leave the block (indent ≤ 2 on a
  // non-blank line).
  for (let i = jobIdx + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") continue;
    const indent = (/^( *)/.exec(line) ?? ["", ""])[1].length;
    if (indent <= 2) break; // left the job block
    if (/^ {4}name\s*:\s*\S/.test(line)) {
      return i + 1; // 1-indexed for human-readable line links
    }
  }

  throw new Error(
    `Job \`${key}\` in ${workflowPath} has no \`name:\` field.\n` +
      `Without an explicit \`name:\`, GitHub falls back to the job key as\n` +
      `the status-check context, which is fragile. Add an explicit\n` +
      `\`    name: …\` line inside the \`${key}:\` block.`,
  );
}

let lineNo;
try {
  lineNo = resolveNameLine(yamlText, jobKey);
} catch (err) {
  fail(1, err.message);
}

process.stdout.write(`${lineNo}\n`);
