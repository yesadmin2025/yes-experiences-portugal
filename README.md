# dreamscape-builder-co

## Hero copy QA in CI

The `scripts/hero-copy-qa.mjs` preflight checks that the deployed preview and
production hero copy match `src/content/hero-copy.ts`. It exposes three JSON
flags designed for CI integration:

| Flag | Purpose |
| --- | --- |
| `--report-json[=<path\|->]` | Emit a structured run report. `-` (or no value) writes to stdout and routes the human log to stderr; any other value is treated as a file path. |
| `--report-json-strict` | Validate every emitted report against the declared `hero-copy-qa@<N>` schema. If `buildReport` ever diverges, the script exits `EXIT.RUNTIME_ERROR (3)` instead of silently emitting a malformed report. |
| `--report-json-schema` | Print the strict-validator schema (`{ schema, shape }`) to stdout and exit `0`. No network calls — safe in air-gapped runners. |

### Exit codes

| Code | Name | Meaning |
| --- | --- | --- |
| `0` | `OK` | All targets matched. |
| `1` | `DRIFT` | Preview/production drift detected. |
| `2` | `FLAG_MISCONFIG` | Bad flag or no targets matched the filter. |
| `3` | `RUNTIME_ERROR` | Script bug or strict-schema violation. |
| `4` | `FETCH_ERROR` | A target URL was unreachable. |

### Exact CI commands

```bash
# 1. One-shot run, structured report written to a file for upload as an artifact.
npm run qa:hero-copy -- \
  --report-json=qa-hero-copy.json \
  --report-json-strict

# 2. One-shot run, JSON streamed to stdout for inline parsing (e.g. jq).
#    The human-readable log is automatically routed to stderr.
npm run qa:hero-copy -- \
  --report-json=- \
  --report-json-strict \
  | jq '.totals'

# 3. Production-only gate (skip preview, useful for post-deploy smoke tests).
npm run qa:hero-copy -- \
  --production-only \
  --report-json=qa-hero-copy.prod.json \
  --report-json-strict

# 4. Preview-only gate (typical PR check before promoting to production).
npm run qa:hero-copy -- \
  --preview-only \
  --report-json=qa-hero-copy.preview.json \
  --report-json-strict

# 5. Print the validator schema and pin against it from a test/lint job.
#    Exits 0, performs no network I/O.
npm run qa:hero-copy -- --report-json-schema

# 6. Assert the schema name from a shell job (fails loudly if it ever bumps).
test "$(npm run --silent qa:hero-copy -- --report-json-schema | jq -r .schema)" \
  = "hero-copy-qa@1"

# 7. Watch mode in CI is rarely useful, but if needed cap the runs and
#    stream one JSON object per tick to stdout.
npm run qa:hero-copy:watch -- \
  --max-runs=3 \
  --report-json=- \
  --report-json-strict
```

### GitHub Actions snippet

```yaml
- name: Hero copy QA (preview)
  run: |
    npm run qa:hero-copy -- \
      --preview-only \
      --report-json=qa-hero-copy.json \
      --report-json-strict

- name: Upload hero-copy QA report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: hero-copy-qa-report
    path: qa-hero-copy.json
```

The companion test `src/content/hero-copy-qa-script.test.ts` locks in this
contract: it spawns the real script, asserts that strict validation passes on
the unmodified emitter, fails with `EXIT.RUNTIME_ERROR (3)` when the report
shape is mutated, and pins `--report-json-schema` output to `hero-copy-qa@1`.
