# Rewound history survives draft reloads

Source: `6d62a65e747e82350eb82d6ba793b179cc8dd87a`.

Addresses [the review finding](https://github.com/getpaseo/paseo/pull/8902#discussion_r4489951101): rewinding restored inherited history into an in-memory attachment list, so reloading before resending discarded it. Restored history now belongs to the existing persisted agent draft, alongside its prompt text. The snapshot retains its structured entries and source. Normal draft removal and successful submission clear it. No wire fields or storage-version migration are added.

## Verified behavior

Both typed and history-only fork prompts: send and reload, rewind, switch between the source and fork to check isolation, inspect the restored snapshot, reload before resending, check isolation and restored text/history again, resend and reload, and verify inline history with no leftover composer attachment. Finally rewind again, remove the history attachment, reload and verify that it remains removed while the prompt text is preserved.

- [Before implementation](before.log): both cases fail because the restored history pill is missing after reload before resend.
- [Unit tests](unit.log): 67 passed across draft schema/lifecycle, rewind restoration, composer actions and live draft state. Added cases round-trip both empty and typed persisted snapshots and verify submission cleanup.
- [Browser suite](browser.log): 13 existing fork and rewind workflows passed. Both extended rewind cases passed persistence/resend but failed at an unnecessary assertion that old inline history remained after a second rewind. That assertion was removed; the final check verifies the retained draft text and absent attachment.
- [Final targeted browser run](browser-final.log): both extended rewind journeys pass. Together these runs cover 15 passing workflows, not a single all-green suite run.
- [Interrupted initial run](interrupted.log): stopped after identifying that the removal helper needed to hover the pill to reveal its remove button. The helper was corrected before the suite and final runs above.
- [Formatting](format.log), [lint](lint.log), [whole-workspace typecheck](typecheck.log), and [commit checks](commit.log) passed.

[History-only screenshot](history-only.png) · [Recording](history-only.webm) · [Typed screenshot](typed.png) · [Recording](typed.webm)

Screenshots capture the inline result after resend/reload; recordings also cover removing and reloading the draft. Both screenshots were inspected. The mock provider retains the original first prompt, so the resend assertion requires the new second snapshot and checks its contents. After a subsequent rewind the single retained mock prompt does not establish that its earlier fork-context metadata remains; the removal check makes no such claim. See the [previous integration evidence](../upstream-integration/README.md) for the mock limitation and separate storage-backed replay coverage.

Actual Expo web app with an isolated daemon on macOS. No native iOS/Android, Electron or live Claude Code/Codex verification in this follow-up. No production daemon restart. No full repository test suite. Logs retain warnings and redact checkout paths/ANSI colors only. Local checks do not establish upstream CI success.
