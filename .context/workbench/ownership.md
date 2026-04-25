# File and directory ownership

Hard rule: agents only write files in their owned paths. To touch anything outside, claim it in `lock.md` first.

## Owners

| Agent | Branch | Owns (write) | May read | Forbidden |
|---|---|---|---|---|
| **agent-arch** (orchestrator) | `agent-arch` | `src/agents/`, `src/services/discovery.ts`, `src/types/index.ts`, `.context/workbench/status.md`, `.context/workbench/ownership.md`, `.context/plans/full-plan.md` | everything | — |
| **ui-polish** | `ui-polish` | `src/components/`, `src/styles/`, `index.html` (only `<head>` font/meta tweaks), `public/` (asset additions only) | everything | services/, agents/, types/index.ts, package.json, vite.config.ts |
| **live-apis** | `live-apis` | `src/services/peec.ts`, `src/services/tavily.ts`, `src/services/gemini.ts`, `src/services/cache.ts`, `src/data/` | everything | discovery.ts, agents/, components/, types/index.ts |
| **demo-data** | `demo-data` | `src/data/curated/`, `.context/demo/` | everything | services/, components/, agents/, types/index.ts |

## Shared files (require lock.md claim)

These files belong to the orchestrator. Any other agent that needs to edit them must claim in `lock.md` and wait for the orchestrator to merge their request.

- `package.json`
- `package-lock.json`
- `vite.config.ts`
- `tsconfig*.json`
- `src/types/index.ts`
- `src/main.tsx`
- `src/App.tsx`
- `CLAUDE.md`
- `.context/plans/*` (except `agent-arch` may edit `full-plan.md`)

## Shared services note

`live-apis` owns the three platform clients. `agent-arch` owns `discovery.ts` (which composes those clients into agents). If `live-apis` needs to change a service signature that `discovery.ts` calls, claim it in `lock.md`.
