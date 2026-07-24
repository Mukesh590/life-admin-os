# Agent Instructions — Life AdminOS

Read before doing any work in this repo:

- `.stitch/CONTEXT-MASTER.md` — durable product/design decisions and the
  source-authority hierarchy.
- `.stitch/LANDING-RESEARCH-FINAL.md` — landing-page implementation spec,
  subordinate to CONTEXT-MASTER.md.
- `.stitch/HANDOFF.md` — current transient status: active writer, branch,
  checkpoint SHAs, next action. Status only, never a source of requirements.

## Authority hierarchy (from CONTEXT-MASTER.md Section 13)

Highest to lowest: (1) Mukesh's latest explicit approved decision, (2)
`CONTEXT-MASTER.md`, (3) the current phase spec (e.g.
`LANDING-RESEARCH-FINAL.md`), (4) supporting visual/motion documents, (5)
`HANDOFF.md` (status only), (6) agent assumptions, lowest authority. If two
higher-authority sources conflict, stop and ask Mukesh — do not resolve
silently.

## Rules

1. **One active writer.** Check `.stitch/HANDOFF.md` for the current active
   writer before editing the working tree. Only one agent edits at a time.
2. **Explicit path-based staging only.** Use `git add <path>` /
   `git add -u <path>` for named files. Never use `git add -A` or
   `git add .`. Verify with `git diff --cached --name-status` before
   committing that only the intended files are staged.
3. **Local checkpoint commits are allowed** on the working branch, including
   before Mukesh's browser verification, so review can happen against a
   stable SHA.
4. **No push or deployment** without Mukesh explicitly saying "deploy."
   Nothing is ever pushed to the production-connected branch without that
   explicit instruction.
5. **Run `npm run lint` and `npm run build`** before committing
   implementation work. Fix failures directly caused by your own changes
   only; stop and report anything unrelated.
6. **Mukesh performs final visual browser approval.** Agent
   self-verification via screenshots has proven unreliable on this project —
   do not report a UI change as "done" based on your own screenshot; report
   what changed and stop.

## Roles (from CONTEXT-MASTER.md Section 13)

Mukesh — product authority, browser QA, deployment approval. Claude Chat —
planning/research, no code execution. Claude Code — primary implementer.
Codex CLI — independent reviewer/tester/debugger/security auditor, secondary
implementer only on explicit handoff. ChatGPT — separate environment,
research/assets only, no automatic repo access.
