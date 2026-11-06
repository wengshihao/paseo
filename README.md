# Forked chat history QA

**Latest: [upstream integration and inline rewind](upstream-integration/README.md).** [Long-answer regression](long-answer/README.md) is retained. [Inline conversation evidence](inline/README.md) is retained. [Review fixes](review/README.md) are also retained. The evidence below records the initial submission.

Source commit: `5d71206b7219c60bc6027d29912a3a52223969ca`. Base: `5abfdf7107b5dabb885964de97dde8b55050613d`.

Evidence for `wengshihao/paseo:feat/chat-history-preview`, targeting getpaseo/paseo issue #8323. Captured on macOS with the actual Expo web app and an isolated Paseo daemon using the repository's mock provider. This branch contains QA artifacts only; none of these assets are added to the source PR.

## Interaction

[Recording](video.webm) · [Wide preview](history-wide.png) · [Compact preview](history-compact.png) · [Original no-op](history-before.png)

The journey forks a completed assistant turn, opens its history before sending, sends the fork prompt, reloads the child, opens the retained history at 390 × 844, follows the source, forks the child again, and follows that child's immediate source. Wide capture: 1280 × 720. Expo's development-only fast-refresh overlay is hidden for the final screenshots; sheet animations are allowed to settle. The selectable body shows the existing fork snapshot, with its machine wrapper removed only for display.

## Regression evidence

- [Original handlers](logs/ui-before.log): with the composer/message attachment renderers restored from upstream `6355b339c8f7ea0f2b4d0f55d315d6a03d7ef434`, clicking the card never opens the preview. Other implementation files were left in place; this isolates the original no-op interaction.
- [UI-only implementation](logs/ui-refresh-before.log): adding the preview without server retention fails after reload because the sent history card is absent.
- [Protocol before](logs/protocol-before.log): source metadata is dropped by the original attachment schema.
- [Final interaction](logs/ui-after.log): passes with retained context and source navigation.
- [Related fork journeys](logs/ui-suite.log): all 7 tests pass, including streaming/failed turns, existing-workspace drafts, new-workspace forks, and persistence after the first user message. This full-file run preceded the upstream rebase and the screenshot/waiting refinements; the final interaction was rerun on the final source branch.

## Checks

Exact commands and their output are in these logs:

| Check | Evidence |
| --- | --- |
| Protocol attachment/schema tests: 14 passed | [protocol.log](logs/protocol.log) |
| App stream and submission tests: 75 passed | [app.log](logs/app.log) |
| Translation/resource and attachment checks: 44 passed (4 attachment checks overlap the app run) | [localization.log](logs/localization.log) |
| Storage-backed restart, native message ID/content matching, later quotations, and rewind: 2 variants passed | [server.log](logs/server.log) |
| Build server and workspace dependencies | [build.log](logs/build.log) |
| Workspace typecheck | [typecheck.log](logs/typecheck.log) |
| Lint | [lint.log](logs/lint.log) |
| Formatting | [format-check.log](logs/format-check.log) |
| Final commit hooks | [commit-hooks.log](logs/commit-hooks.log) |

Logs preserve output including existing warnings. Local checkout paths and ANSI color sequences are removed. No production daemon was restarted. No full repository test suite was run.

## Coverage limits

Browser web at wide and compact widths was exercised and screenshots inspected. Compact web is not native mobile verification. iOS, Android, and the Electron wrapper on macOS/Windows/Linux were not exercised. No live Claude Code or Codex sessions were used; provider invocation and snapshot generation are unchanged.

The persisted source link and replay attachment apply to forks sent with the updated app and daemon. This change does not reconstruct source identities that older versions discarded. The history remains the existing curated, size-limited fork snapshot rather than a new native provider fork or a full branch-tree view.
