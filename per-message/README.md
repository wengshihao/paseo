# Per-message fork history persistence

Source commit: `5208e7f7aa5b6b9b9a3f43153fa37cea43248d2a` (PR #8902). Captured on macOS, 2026-11-06.

## Fix and regression

A second history-bearing submission used to replace the agent's single stored fork context. Provider replay could then lose the first message's structured history and source. Contexts are now stored by client message ID, with legacy single-context records accepted on read. Native message IDs take precedence; when the provider omits IDs, each matching snapshot can be claimed only once per replay. The longest matching snapshot wins over a shorter nested snapshot.

- [Original failure](logs/before.log): the first history is missing after replay with two submissions.
- [Identical-snapshot failure](logs/identical-before.log): without per-replay claims, identical text with different source metadata incorrectly reuses the first context.
- [Final regressions](logs/final-unit.log): **10 passed**, 236 unrelated cases skipped. Six new cases combine native/local/missing IDs with distinct/identical snapshot text, exercise forced replay, storage-backed restart and rewind. Four existing cases cover legacy persisted records and local-submission-ID replay.
- [Real Codex](logs/codex-final.log): **1 passed**, 2 unrelated cases skipped. Codex CLI `0.166.0-alpha.6`, local ChatGPT authentication. Two actual provider turns complete with the requested reply; both structured snapshots survive provider reload and manager restart; a native conversation rewind removes the second prompt while preserving the first history. This is opt-in through `PASEO_FORK_HISTORY_QA=1`.

## Application verification

| Target | Result | Evidence |
| --- | --- | --- |
| Browser, complete assistant-fork file | 11 passed | [Log](logs/browser-final.log), [wide](browser/history-wide.png), [compact](browser/history-compact.png), [recording](browser/video.webm) |
| macOS Electron, main fork journey | 1 passed | [Log](logs/desktop-main.log), [wide](desktop/history-wide.png), [compact](desktop/history-compact.png), [recording](desktop/video.webm) |
| macOS Electron, both rewind/resend journeys | 2 passed in a separate targeted run | [Log](logs/desktop-rewind.log), [history-only screenshot](desktop-rewind-history-only/history-after-rewind.png), [typed screenshot](desktop-rewind-typed/history-after-rewind.png), [history-only recording](desktop-rewind-history-only/video.webm), [typed recording](desktop-rewind-typed/video.webm) |
| Build server and workspace dependencies | Passed | [Log](logs/build-final.log) |
| Whole-workspace typecheck | Passed | [Log](logs/typecheck-final.log) |
| Lint | 0 warnings, 0 errors | [Log](logs/lint-final.log) |
| Formatting and commit hooks | Passed | [Server formatting](logs/format-final.log), [helper formatting](logs/ui-format.log), [hooks](logs/commit.log) |

Browser coverage includes long saved answers, live viewers, streaming/repeated forks, source navigation, reload, workspace creation, host changes, draft removal, and rewind/resend. Electron uses the actual compiled main/preload and Electron-target Expo renderer with an isolated profile and test daemon. The three Electron cases passed across two final runs, not one combined run. Wide and compact screenshots were inspected. No production daemon was restarted.

Desktop testing exposed shared test-helper assumptions: hidden tab composers were being selected, and tab navigation could finish before the fork attachment arrived. Helpers now select the visible composer and wait for the inherited attachment before sending. The final browser file was rerun after these changes.

## Reproduction

Run from the source checkout with Node 22 and dependencies installed:

```sh
npm run test:unit --workspace=@getpaseo/server -- src/server/agent/agent-manager.test.ts -t 'preserves every fork snapshot|fork history survives storage-backed replay|restores fork history after a local' --bail=1
PASEO_FORK_HISTORY_QA=1 npm exec --workspace=@getpaseo/server -- vitest run src/server/agent/providers/codex-app-server-agent.real.e2e.test.ts -t 'restores multiple fork snapshots' --bail=1
npm run build:server
E2E_RECORD_VIDEO=1 npm run test:e2e --workspace=@getpaseo/app -- e2e/browser/assistant-fork-menu.spec.ts
npm run lint
npm run typecheck
```

The [desktop harness](desktop-harness/) is QA-only and is not added to the source PR. Copy its three files into `<checkout>/.tmp/fork-history-desktop/`, replace the literal `<checkout>` prefix in `smoke.spec.ts` with the absolute source checkout, install the Electron runtime and build its main process:

```sh
npm exec --workspace=@getpaseo/desktop -- install-electron
npm run build:main --workspace=@getpaseo/desktop
E2E_DESKTOP_RUNTIME=1 E2E_RECORD_VIDEO=1 npm exec -- playwright test --config .tmp/fork-history-desktop/playwright.config.ts --grep 'retains inherited context when rewinding'
E2E_DESKTOP_RUNTIME=1 E2E_RECORD_VIDEO=1 npm exec -- playwright test --config .tmp/fork-history-desktop/playwright.config.ts --grep 'reads fork history before' --output ../per-message-desktop-main-results
```

Remove the temporary harness before linting the source tree. It uses the existing test-daemon setup and creates/removes only its own Electron profile. English locale is explicit. An empty extension-cache directory avoids downloading optional React DevTools; the resulting optional-extension warning remains in the logs. Renderer/preload IPC is real, not mocked.

## Attempts and limits

Earlier Electron attempts are retained as `logs/attempt-desktop*.log`: optional DevTools download blocked window creation; subsequent harness corrections handled absolute navigation, startup navigation completion, and locale. Two later runs passed the main journey but exposed hidden-composer/tab-readiness assumptions in rewind tests. Only the final runs listed above are counted as passing evidence. Existing startup/extension warnings remain in raw logs.

An initial server `npm run test` wrapper invocation forwarded filters only to its later integration phase and started a broader unit phase. It was interrupted when detected; [that output](logs/interrupted.log) is not claimed as validation. All subsequent server regressions used the explicitly filtered `test:unit` script. No complete repository-suite result is claimed.

Native iOS/Android, Windows/Linux Electron, and live Claude Code were not tested: the local environment has no Claude CLI, Android tools or iOS simulator. Compact web/Electron is not native-mobile coverage. The long-answer workflow checks readability, not native rendering performance. Mock UI rewind behavior retains its first prompt; the separate real Codex test verifies actual native rewind removal. Matching anonymous identical snapshots is exercised in provider replay order; discarded identities cannot be reconstructed in arbitrary ambiguous histories.

Logs retain failures and warnings, with ANSI escapes and local checkout/home paths removed. No traces or authentication material are included. Prior feature validation is indexed in the [QA root](../README.md).
