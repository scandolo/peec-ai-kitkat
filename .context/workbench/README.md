# SWARM Agent Workbench

Coordination layer for parallel Claude Code agents working on SWARM. Read this before doing anything.

## How it works

We run multiple Claude Code instances in parallel via Conductor, each on its own branch, each owning a specific directory. They never edit each other's files. They communicate by appending to files in this workbench.

## Files in this directory

| File | Purpose | Who writes |
|---|---|---|
| `README.md` | This file. | Read-only. |
| `status.md` | The single source of truth for what's happening. Updated by orchestrator. | Orchestrator (federico + lead agent on `agent-arch`). |
| `ownership.md` | Who owns which files/dirs. Hard rule: do not edit files outside your ownership. | Orchestrator only. |
| `decisions.md` | Append-only log of decisions made. Each entry is dated and signed. | Any agent appends; never edits prior entries. |
| `lock.md` | Soft-claims when an agent needs to touch a file outside its ownership. | Any agent. |
| `agents/<name>.md` | One file per agent. Running notes, blockers, handoff notes. | Only the named agent writes its own file. |
| `visual-references.md` | Index of Peec UI screenshots in `.context/peec-references/`. | UI agent updates as references are added. |

## Hard rules for every agent

1. **First action of every turn**: read `status.md` and your own `agents/<name>.md`.
2. **Last action of every turn**: append a dated bullet to your `agents/<name>.md` summarising what you did and what's next.
3. **Stay in your lane**. Check `ownership.md`. If you need to touch a file outside your ownership, claim it in `lock.md` first and announce it in `agents/<name>.md`.
4. **Always run `npm run typecheck` before committing.** Do not commit failing builds.
5. **Branch hygiene**: each agent works on its own branch. Do not merge other branches into yours unless coordinated through `decisions.md`.
6. **Never touch `.env` or `.env.local`**. Read keys via Vite env vars only.
7. **Never edit `package.json`, `vite.config.ts`, or `src/types/index.ts` without claiming in `lock.md` first.** These are shared.

## When you finish your slice

1. Append a final note in `agents/<name>.md` saying "ready to merge".
2. Update `status.md` (or ping orchestrator).
3. Wait for orchestrator to merge. Do NOT merge yourself unless explicitly authorised.

## Conflict resolution

If two agents both need to edit the same file, the one who claims it in `lock.md` first wins. The other waits or coordinates via `decisions.md`. The orchestrator (federico + lead on `agent-arch`) breaks ties.
