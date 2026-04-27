#!/usr/bin/env bash
# scripts/ci/retention-lib.sh
#
# Shared shell library for hero-copy QA artifact retention validation.
#
# Single source of truth for:
#   - the GitHub artifact-retention hard cap (RETENTION_MAX = 90)
#   - the workflow's literal fallback default (RETENTION_DEFAULT = 14)
#   - "first non-empty wins, else default" precedence resolution
#   - per-input validation (empty | 1..MAX, anything else fails)
#   - post-precedence revalidation (must be 1..MAX, never empty)
#   - resolution-and-emit for all three QA artifacts (report/logs/meta)
#     including writing GITHUB_OUTPUT entries the upload steps consume
#
# Sourced by .github/workflows/hero-copy-lock.yml from BOTH:
#   1. the per-input validator step (raw inputs)
#   2. the post-precedence validator step (resolved values)
# so the precedence chain and validation rules cannot drift between
# them — any change to retention rules happens once, here.
#
# Usage from a workflow step:
#   source scripts/ci/retention-lib.sh
#   FAILED=0
#   retention_validate_input "qa_report_retention_days" "$QA_REPORT_RETENTION" || FAILED=1
#   ...
#   [ "$FAILED" -eq 0 ] || exit 1
#
# Or, for the post-precedence step, use the all-in-one helper:
#   source scripts/ci/retention-lib.sh
#   retention_resolve_all   # resolves, validates, writes GITHUB_OUTPUT
#
# All functions return 0 on success, 1 on validation failure. They
# print human-readable progress to stdout and ::error annotations to
# stdout (which GitHub picks up as workflow annotations). They never
# call `exit` themselves — callers decide whether to abort.

# ─────────────────────────────────────────────────────────────────────
# Constants — the ONLY place these values live.
# ─────────────────────────────────────────────────────────────────────
RETENTION_MAX=90      # GitHub's hard cap for actions/upload-artifact@v4
RETENTION_DEFAULT=14  # Workflow fallback when every precedence slot empty

# ─────────────────────────────────────────────────────────────────────
# retention_first_nonempty <value...>
#
# Print the first non-empty argument; if all are empty, print
# RETENTION_DEFAULT. Used to resolve the precedence chains:
#   report:  REPORT
#   logs:    LOGS  || REPORT
#   meta:    META  || LOGS  || REPORT
# (each followed by RETENTION_DEFAULT as the implicit final fallback).
#
# Always exits 0; output is never empty.
# ─────────────────────────────────────────────────────────────────────
retention_first_nonempty() {
  local v
  for v in "$@"; do
    if [ -n "$v" ]; then
      printf '%s' "$v"
      return 0
    fi
  done
  printf '%s' "$RETENTION_DEFAULT"
}

# ─────────────────────────────────────────────────────────────────────
# retention_validate_input <name> <value>
#
# Validate a RAW user input. Empty is OK (means "use the fallback
# chain"); otherwise must be a positive integer 1..RETENTION_MAX.
#
# Returns 0 on OK, 1 on failure. Prints ::error annotations on failure.
# ─────────────────────────────────────────────────────────────────────
retention_validate_input() {
  local name="$1"
  local value="$2"
  if [ -z "$value" ]; then
    echo "✓ $name: (empty — falling back to default chain)"
    return 0
  fi
  # Must be a positive integer (no leading zeros, no signs, no decimals,
  # no whitespace). A bare '0' is also rejected (zero-day retention is
  # not meaningful for triage artifacts).
  if ! printf '%s' "$value" | grep -Eq '^[1-9][0-9]*$'; then
    echo "::error title=Retention input: not a positive integer::$name='$value' is not a positive integer. Allowed: empty (use default) or an integer in 1..$RETENTION_MAX."
    return 1
  fi
  if [ "$value" -gt "$RETENTION_MAX" ]; then
    echo "::error title=Retention input: exceeds GitHub maximum::$name='$value' exceeds GitHub's hard cap of $RETENTION_MAX days. Please re-run the workflow with $name <= $RETENTION_MAX."
    return 1
  fi
  echo "✓ $name: $value day(s)"
  return 0
}

# ─────────────────────────────────────────────────────────────────────
# retention_validate_effective <name> <value>
#
# Validate a value AFTER precedence has been resolved. Stricter than
# retention_validate_input: empty is NOT allowed (resolution always
# falls back to RETENTION_DEFAULT, so an empty effective value is a
# workflow bug, not a user mistake). Otherwise same 1..RETENTION_MAX
# rule.
#
# Error messages explicitly mention "after precedence" and the
# RETENTION_DEFAULT so reviewers can distinguish "user typed a bad
# value" from "the workflow's default chain itself is broken".
#
# Returns 0 on OK, 1 on failure. Prints ::error annotations on failure.
# ─────────────────────────────────────────────────────────────────────
retention_validate_effective() {
  local name="$1"
  local value="$2"
  if ! printf '%s' "$value" | grep -Eq '^[1-9][0-9]*$'; then
    echo "::error title=Retention effective: not a positive integer::$name resolved to '$value' after precedence (default=$RETENTION_DEFAULT). This is a workflow bug — the fallback chain produced a non-numeric value."
    return 1
  fi
  if [ "$value" -gt "$RETENTION_MAX" ]; then
    echo "::error title=Retention effective: exceeds GitHub maximum::$name resolved to '$value' day(s) after precedence, which exceeds GitHub's hard cap of $RETENTION_MAX. Lower the corresponding input or the workflow default ($RETENTION_DEFAULT)."
    return 1
  fi
  echo "✓ effective $name: $value day(s)"
  return 0
}

# ─────────────────────────────────────────────────────────────────────
# retention_resolve_all
#
# All-in-one helper for the post-precedence step. Reads:
#   QA_REPORT_RETENTION  QA_LOGS_RETENTION  QA_META_RETENTION
# from the environment (caller provides via `env:`), resolves each
# artifact's effective retention via the precedence chain, validates
# every resolved value, and writes the result to GITHUB_OUTPUT as
# `report=`, `logs=`, `meta=`.
#
# Returns 0 on OK, 1 if any effective value is invalid. Caller should
# `exit 1` on non-zero return so the upload steps' guard
# (`steps.retention.outcome == 'success'`) skips them.
# ─────────────────────────────────────────────────────────────────────
retention_resolve_all() {
  local report_eff logs_eff meta_eff failed=0

  report_eff="$(retention_first_nonempty "$QA_REPORT_RETENTION")"
  logs_eff="$(retention_first_nonempty   "$QA_LOGS_RETENTION"  "$QA_REPORT_RETENTION")"
  meta_eff="$(retention_first_nonempty   "$QA_META_RETENTION"  "$QA_LOGS_RETENTION" "$QA_REPORT_RETENTION")"

  retention_validate_effective "hero-copy-qa-report retention" "$report_eff" || failed=1
  retention_validate_effective "hero-copy-qa-logs   retention" "$logs_eff"   || failed=1
  retention_validate_effective "hero-copy-qa-meta   retention" "$meta_eff"   || failed=1

  if [ "$failed" -ne 0 ]; then
    echo ""
    echo "Refusing to upload artifacts: at least one effective retention value is invalid."
    echo "GitHub allows 1..$RETENTION_MAX days for actions/upload-artifact@v4."
    return 1
  fi

  # GITHUB_OUTPUT is set by the GitHub Actions runner; in local dev /
  # unit tests it may be absent — fall back to /dev/null so the lib
  # stays sourceable outside CI.
  : "${GITHUB_OUTPUT:=/dev/null}"
  {
    echo "report=$report_eff"
    echo "logs=$logs_eff"
    echo "meta=$meta_eff"
  } >> "$GITHUB_OUTPUT"

  echo ""
  echo "All effective retentions valid; uploads will use:"
  echo "  hero-copy-qa-report : $report_eff day(s)"
  echo "  hero-copy-qa-logs   : $logs_eff day(s)"
  echo "  hero-copy-qa-meta   : $meta_eff day(s)"
  return 0
}
