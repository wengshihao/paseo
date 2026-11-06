# Complete saved answers

Source: `735ee0287754f987f1b552ca5dd9d4225648aabe`.

Addresses [the long-answer review finding](https://github.com/getpaseo/paseo/pull/8902#discussion_r4489446221). The shared web assistant component defaults to a 32,000-character display cap. The inherited-history renderer now opts into its existing `renderFullContent` mode, so the saved answer remains readable to its end. The fork snapshot's 100,000-character budget is unchanged.

## Regression

The added browser scenario uses the actual app and isolated daemon with the repository mock provider, whose answer exceeds 40,000 characters. It forks that conversation, scrolls to the final paragraph in the draft, submits, reloads at 390 x 844, and scrolls to the same paragraph again. It asserts the ending is inside the viewport and no truncation notice appears. Selectors and scrolling stay in the shared helper.

- [Before](before.log): fails because the final paragraph is absent from the draft DOM.
- [After](after.log): the targeted scenario passes (6.4 seconds; 16 seconds including setup).
- [Draft screenshot](long-history-draft.png), [reloaded compact screenshot](long-history-reloaded.png), [recording](video.webm). Both final screenshots were inspected.
- [Formatting](format.log) and [commit hooks](commit.log), including lint and whole-workspace typecheck, pass.

The earlier eight browser journeys and their evidence remain in ../inline; only this new targeted regression was rerun for the one-prop production fix. Web on macOS was exercised; native iOS/Android, Electron and real Claude Code/Codex sessions were not exercised. Native already uses an uncapped renderer. No production daemon was restarted. Logs preserve warnings and redact checkout paths and ANSI colors only.
