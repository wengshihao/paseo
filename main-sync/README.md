# Shared conversation panel integration

Source: `57f3107a6b0d66c943cce240a5390e81c3e0fdeb`. Merged upstream main at `e79e826e23846311c2325be2329b090b380ff98f` without rewriting existing PR commits.

Upstream separated the draft composer from the shared conversation panel. Its removal of the old draft content conflicted with the inline history renderer. The draft history now renders in that shared panel through a focused component, keeping the existing transcript, source navigation, attachment scopes and spacing. The upstream composer remains unchanged. Pending submission continues through upstream's draft timeline.

## Verification

- [Browser](browser.log): all 11 fork workflows passed in one run. Includes inline draft/submitted history, source navigation, repeated forks, long saved answers, both rewind/reload/resend/removal forms, another live viewer, streaming/failed turns, new tabs/workspaces and host changes.
- [Draft timeline and creation-flow tests](unit.log): 9 passed.
- [Format](format.log), [lint](lint.log), [workspace typecheck](typecheck.log) and [commit hooks](commit.log) passed.

[Wide draft](history-wide.png) · [Compact reloaded conversation](history-compact.png) · [Recording](video.webm)

Both screenshots inspected. Actual Expo browser app and isolated daemon with the repository mock provider on macOS. Native iOS/Android, Electron and live Claude Code/Codex were not tested. The upstream native-only LegendList patch was not exercised by this browser run. No production daemon restart or full repository test suite. Logs retain warnings; checkout paths and ANSI sequences are redacted.

The prior head `6d62a65` received a Greptile 5/5 review with zero new comments across 48 files. That review predates this integration commit; it is not a CI result or approval of this new head.
