# Upstream fixes with inline history

Source: `dc63d9f7f10fc0535be9939e1015547ed3dc5487`.

This merge retains all four upstream commits from [#8910](https://github.com/getpaseo/paseo/pull/8910) through `47691eee91ced308730a4b28e1e4236330b5828b` and their authorship. It incorporates cached-message reconciliation, provider-local ID handling, rewind restoration with a chat-specific attachment scope, and the creation-flow source-metadata assertion. #8910 carries the card-preview fix; this branch retains the additional inline UI.

## Inline adaptation

The inline renderer removes the history card from the submitted user bubble. It must still pass that context to the message actions. The actual submission now keeps its copy/rewind metadata even when inherited text is rendered above it. History-only submissions have visible actions without an empty bubble. The bubble content was extracted into a focused component to stay within the repository's complexity limit.

The added rewind journeys verify: submit, reload, rewind, switch to the source chat (no restored history attachment there), switch back (history attached), inspect the restored snapshot, resend, and reload. Both empty and typed fork prompts are covered.

## Results

- [App targeted unit tests](app.log): 87 passed across stream reconciliation, composer restoration and draft creation.
- [Manager replay regressions](replay.log): 4 passed, 236 unrelated tests skipped. Includes local submission IDs, missing/different replay IDs, storage-backed replay, later quotations and rewind removal.
- [History-only regression before inline adaptation](rewind-before.log): no rewind control. The typed attempt in that run also exposed a hover-helper issue; it hovered the full-width alignment row rather than the content that owns hover state.
- [Typed regression after correcting the hover helper, before inline adaptation](typed-before.log): restored history attachment is absent after rewind.
- [Browser suite](browser-suite.log): 13 existing workflows passed, covering the nine existing fork/long-answer journeys and four rewind contracts. The two new journeys reached resend but their single-snapshot expectation was incompatible with the mock provider's retained first prompt.
- [Final targeted rewind run](rewind-after.log): both new journeys passed after explicitly verifying the resent snapshot. Together the targeted and suite runs cover 15 passing workflows; this is not represented as a single all-green suite run.
- [First integration run](browser-first.log) also caught a preview helper that matched both inline and modal source buttons; it now scopes the check to the modal.
- [Build](build.log), [format](format.log), [lint](lint.log), [typecheck](typecheck.log), and [commit hooks](commit.log) passed. The final helpers were formatted and checked by the hooks.

## Test-provider limitation

`MockLoadTestAgentSession.keepFirstUserMessageHistory()` deliberately retains the first submitted prompt on rewind. Resending therefore produces a retained original and a new history snapshot in this test provider. The resend assertion requires two snapshots and checks the last one; otherwise the retained original could falsely satisfy the check. We did not change the provider or deduplicate submitted content to hide this behavior. The production storage-backed replay regression separately verifies a genuinely removed fork prompt is not resurrected.

[History-only screenshot](history-only.png) · [Recording](history-only.webm) · [Typed screenshot](typed.png) · [Recording](typed.webm)

Both final screenshots were inspected. The repeated snapshot in these images is the mock behavior described above, not proof of a live provider rewind. Actual Expo web and isolated daemon on macOS; no native iOS/Android, Electron or live Claude Code/Codex run in this follow-up. The earlier platform limits remain. No production daemon restart. Logs keep warnings and redact checkout paths/ANSI colors only.

GitHub's run for the previous head reported `action_required`; local checks do not establish upstream CI success.
