# Inline fork conversation

Source: `5dd397a751240b08ea667e7ad12917545399df6a`, PR #8902.

Inherited user messages and assistant replies now use the ordinary message components directly above the fork prompt. Markdown and code highlighting use the same renderer. A quiet source bar links to the immediate parent; a divider marks where the new conversation starts. No timestamps are invented for snapshot entries. History-only forks do not create an empty user bubble. New-tab drafts show history before sending; the New Workspace configuration screen retains its attachment preview, then shows the inline conversation once launched.

The snapshot carries optional structured roles rather than parsing speaker-looking labels out of prose. Repeated forks flatten those entries within the existing 100,000-character prompt budget. Tool summaries remain summaries. Older stored snapshots without roles remain readable as text.

## Visual proof

[Wide draft](history-wide.png) · [Compact conversation after reload](history-compact.png) · [Full journey recording](video.webm)

The real Expo app connects to an isolated daemon using the repository mock provider. The journey forks, reads the visible user bubble and Markdown answer without opening a modal, sends, reloads at phone width, follows the source, forks the child, verifies ancestor and child text, and follows the immediate source. Final images were inspected after correcting the spacing token.

## Checks

- [Red](before.log): structured role regression fails before implementation.
- [Curator](curator.log): 27 passed, including literal `[User]` inside assistant prose, repeated generations, blank submissions and size limits.
- [Protocol](protocol.log): 14 passed; both submission and timeline preserve role metadata.
- [Submission](submit.log): 4 passed.
- [Storage-backed replay](replay.log): 2 selected variants passed; 236 unrelated tests skipped. Restores structured entries with and without provider echo, avoids later quoted snapshots, and respects rewind.
- [Browser suite](browser-suite.log): all 8 fork workflows passed, including streaming, another connected client's live history-only message, reloads, new-tab/new-workspace creation and host changes.
- [Final visual rerun](browser-final.log): main journey passed on the committed spacing; the other seven workflows were unchanged by that final style-only correction.
- [First browser run](browser-first.log): 6 passed, 2 failed. One selector read the hidden draft's inherited assistant after switching to the live source; it now selects visible messages. The other assertion used the wrong fixture text. Neither was retried without fixing the cause.
- [Build](build.log), [format](format.log), [lint](lint.log), and final [commit hooks including whole-workspace typecheck](commit.log) passed.

The earlier review-fix red/green logs remain in ../review. Logs retain warnings; only checkout paths and ANSI colors are removed. No production daemon was restarted.

## Coverage and limits

Browser web on macOS: 1280 x 720 and 390 x 844. Native iOS/Android, Electron and live Claude Code/Codex were not exercised. Compact browser coverage is not native verification. Large-history native rendering performance is not benchmarked: the bounded inherited snapshot renders within its parent timeline row, while the surrounding timeline keeps its existing virtualization. This is a read-only snapshot presentation, not native-provider branch operations.
