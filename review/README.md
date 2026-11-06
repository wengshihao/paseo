# Review follow-up

Source: `5800a626b98d7d11099cf18062299c9be52fc63f`, addressing the three Greptile findings on PR #8902.

- Repeated forks include inherited snapshots within the existing 100,000-character budget. The shared envelope extractor keeps successive previews free of nested machine wrappers. Generic activity summaries do not gain the full inherited context.
- Live and hydrated user messages share content normalization. History-only submissions count as content, and canonical live messages carry their attachment on both insertion paths.
- Browser selectors, active-tab identification, preview actions, and QA captures live in shared helpers. The scenario now asserts the original ancestor prompt survives the next fork.

## Regression results

Both correctness findings were reproduced with new tests before their implementation fixes:

| Check | Before | After |
| --- | --- | --- |
| Live recipient, no optimistic state | [Expected failure: history-only message absent](live-before.log) | [75 stream tests passed, including four live insertion/text variants](live-after.log) |
| Repeated forks | [Expected failure: ancestor question absent](fork-before.log) | [26 curator tests passed, including repeated generations and inherited-context budget](fork-after.log) |
| Browser workflow | | [8 complete fork journeys passed](browser.log) |

[Repeated fork / reload / source navigation recording](video.webm) · [Live recipient recording](live-history.webm)

The new live browser scenario sends a history-only message from a separate SDK connection into an already displayed agent. The browser receives and opens the card without reloading. The complete fork journey also checks both the original ancestor prompt and the child prompt in the grandchild preview.

[Build](build.log), [typecheck](typecheck.log), [lint](lint.log), [format](format.log), and [final commit hooks](commit.log) passed. The browser run preceded only the final extraction of shared content-normalization/user-entry helpers; both affected unit suites and all checks were rerun after that extraction.

The previous platform limits remain: actual browser web on macOS, including compact width; no native iOS/Android, Electron wrapper, or live Claude Code/Codex sessions. Logs retain existing warnings and redact only local checkout paths and ANSI colors. The original submission evidence remains in the parent directory.
