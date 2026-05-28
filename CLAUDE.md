# CLAUDE.md
> Operating instructions for Claude Code working on this repository.
> Read this file before every task. If a rule conflicts with a user request,
> surface the conflict — do not silently override.

---

## 1. Project

**voxbar** — cross-platform desktop STT widget. Press a global shortcut,
speak, get text injected into the focused field. Backends: local LM Studio
or any OpenAI-compatible cloud provider.

Repo layout:
```
voxbar/
├── src/                  # React + TS frontend (HUD, settings)
├── src-tauri/            # Rust backend (audio, injection, IPC)
│   ├── src/
│   └── tauri.conf.json
├── packages/
│   └── stt-core/         # Shared provider abstraction, Zod schemas
├── tests/
│   ├── unit/             # Vitest
│   └── e2e/              # Playwright
└── CLAUDE.md             # this file
```

## 2. Stack (locked)

| Layer | Tool | Version |
|---|---|---|
| Shell | Tauri | v2.x |
| Frontend | React + TypeScript | 19 / 5.6+ |
| UI kit | shadcn/ui + Tailwind | latest / v4 |
| State | Zustand | latest |
| Validation | Zod | v3 |
| Audio (native) | cpal | latest |
| VAD | @ricky0123/vad-web | latest |
| Text injection | enigo | latest |
| Tests | Vitest + Playwright | latest |
| Lint/format | Biome | latest |
| Package manager | pnpm | v9+ |

**Do not introduce a new dependency without asking.** No ESLint, no Prettier,
no Redux, no MUI, no Electron. Stack is final.

## 3. Code style

### TypeScript
- Strict mode on, `noUncheckedIndexedAccess: true`.
- **Shorthand-first.** Object shorthand, arrow functions, optional chaining,
  nullish coalescing, destructuring. No `function` keyword except for hoisting needs.
- **No `any`.** Use `unknown` + narrow, or generics. Justify any `as` cast in a comment.
- **No `enum`.** Use `as const` objects + union types.
- **Discriminated unions** for state machines and result types.
- **`Result<T, E>` over thrown errors** at module boundaries; throw only for true bugs.
- Imports: external → internal alias (`@/…`) → relative. Biome sorts automatically.
- Filename: `kebab-case.ts`. Component file: `kebab-case.tsx`, default export
  named in `PascalCase`.

### React
- **Server-thinking first** even though this is a Tauri SPA: derive, don't store.
- Hooks: only at top level, never conditional. Custom hooks prefixed `use`.
- `useEffect` is a last resort — prefer event handlers and derived state.
- **No prop drilling > 2 levels** — lift to Zustand slice.
- Keys must be stable IDs, never array index.

### Rust (src-tauri)
- `cargo clippy -- -D warnings` must pass.
- `Result<T, anyhow::Error>` at command boundaries, typed errors internally.
- All Tauri commands take `&AppHandle` or `State<…>`, never global statics.
- No `unwrap()` outside tests. `expect()` only with a justification string.

## 4. SOLID applied here

| Principle | Concretely in voxbar |
|---|---|
| **S**RP | One provider = one file. One Zustand slice = one concern (audio, session, config, history). |
| **O**CP | New STT backend = new `SttProvider` implementer; no edits to the session manager. |
| **L**SP | All providers honour `TranscribeInput` → `TranscribeResult` exactly; no surprise side-effects. |
| **I**SP | Split `SttProvider` (transcribe) from `HealthCheckable` (probe). Don't force probes on every caller. |
| **D**IP | Session manager depends on the `SttProvider` interface, never on `LmStudioProvider` or `OpenAiProvider` directly. Injection at app bootstrap. |

## 5. The provider contract (canonical)

Every backend implements exactly this. Do not extend without an ADR.

```ts
type TranscribeInput = {
  audio: Blob;
  language?: string;
  prompt?: string;
  signal?: AbortSignal;
};
type TranscribeResult = {
  text: string;
  durationMs: number;
  model: string;
};
type SttError =
  | { kind: 'network' }
  | { kind: 'auth' }
  | { kind: 'rate-limit'; retryAfterMs?: number }
  | { kind: 'server'; status: number; body?: string }
  | { kind: 'aborted' };

interface SttProvider {
  readonly id: 'local' | 'cloud';
  transcribe(input: TranscribeInput): Promise<Result<TranscribeResult, SttError>>;
  healthCheck(): Promise<boolean>;
}
```

## 6. Constraints (hard rules)

- **DO NOT modify** `src-tauri/tauri.conf.json` allowlist without explicit ask.
- **DO NOT** log raw audio buffers, API keys, or transcription text at `info`+ level.
- **DO NOT** add network calls outside `packages/stt-core/`.
- **DO NOT** persist API keys to JSON/TOML — OS keychain only (`tauri-plugin-stronghold`).
- **DO NOT** introduce a new state library, router, or CSS framework.
- **DO NOT** refactor files you weren't asked to touch.
- **DO NOT** remove existing tests, error handling, or telemetry-suppression code.
- **DO NOT** change public types in `packages/stt-core/` without updating consumers in the same PR.
- **DO NOT** ship `console.log` in production paths — use the `logger` module.

## 7. Workflow for non-trivial changes

If the task touches ≥ 3 files, modifies a public type, or adds a dependency:
1. **List** files to modify, one-line rationale each.
2. **Diff plan**: what changes, what stays, what breaks.
3. **Risks**: edge cases, OS-specific gotchas (Wayland vs X11, macOS permissions, Windows Defender).
4. **Stop. Wait for approval.** Then implement.

For trivial changes (single file, < 30 LOC, no API change): just do it.

## 8. Testing requirements

- **Every new provider** ships with a contract test using MSW-mocked HTTP.
- **Every new Zustand slice** ships with a Vitest spec covering each action.
- **Every Rust command** has at least one `#[test]` covering the happy path
  and one expected error.
- Bug fix = regression test first, then the fix.
- E2E (Playwright) is not optional for features touching the HUD flow.

Test naming: `describe('subject', () => { it('does X when Y', …) })`.
No `should`, no nested `describe` deeper than 2 levels.

## 9. Example — idiomatic provider

This is the reference style. Match it.

```ts
// packages/stt-core/src/providers/openai-compatible.ts
import { z } from 'zod';
import type { SttProvider, TranscribeInput, TranscribeResult, SttError } from '../types';
import { ok, err, type Result } from '../result';

const ResponseSchema = z.object({ text: z.string() });

type Config = {
  baseURL: string;
  apiKey?: string;
  model: string;
};

export const createOpenAiCompatibleProvider = (
  id: 'local' | 'cloud',
  cfg: Config,
): SttProvider => ({
  id,
  async transcribe({ audio, language, prompt, signal }: TranscribeInput):
    Promise<Result<TranscribeResult, SttError>> {
    const form = new FormData();
    form.append('file', audio, 'audio.wav');
    form.append('model', cfg.model);
    if (language) form.append('language', language);
    if (prompt) form.append('prompt', prompt);

    const started = performance.now();
    try {
      const res = await fetch(`${cfg.baseURL}/v1/audio/transcriptions`, {
        method: 'POST',
        headers: cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : undefined,
        body: form,
        signal,
      });
      if (res.status === 401) return err({ kind: 'auth' });
      if (res.status === 429) {
        const ra = Number(res.headers.get('retry-after')) * 1000 || undefined;
        return err({ kind: 'rate-limit', retryAfterMs: ra });
      }
      if (!res.ok) {
        return err({ kind: 'server', status: res.status, body: await res.text() });
      }
      const parsed = ResponseSchema.parse(await res.json());
      return ok({
        text: parsed.text,
        durationMs: performance.now() - started,
        model: cfg.model,
      });
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        return err({ kind: 'aborted' });
      }
      return err({ kind: 'network' });
    }
  },
  async healthCheck() {
    try {
      const res = await fetch(`${cfg.baseURL}/v1/models`, {
        headers: cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : undefined,
      });
      return res.ok;
    } catch {
      return false;
    }
  },
});
```

Note: arrow factory, discriminated `SttError`, `Result` over throws, Zod at
the boundary, no `any`, AbortSignal honoured, timing measured, side-effect-free.

## 10. Commit message format

Conventional Commits, scoped:
```
<type>(<scope>): <subject>
[optional body]
[optional footer]
```

| type | use |
|---|---|
| feat | new user-visible capability |
| fix | bug fix |
| refactor | no behaviour change |
| perf | measurable perf change (include numbers) |
| chore | tooling, deps |
| docs | README, CLAUDE.md, ADRs |
| test | tests only |

Scopes: `core`, `hud`, `settings`, `audio`, `vad`, `provider`, `tauri`, `ci`.

Examples:
- `feat(provider): add openai-compatible cloud backend`
- `fix(audio): release cpal stream on session abort`
- `perf(vad): switch silero to int8 quantised model (-40% CPU)`

One logical change per commit. No "wip", no "fix stuff".

## 11. Definition of Done

A change is done when **all** are true:
- [ ] `pnpm biome check .` clean
- [ ] `pnpm tsc --noEmit` clean
- [ ] `cargo clippy -- -D warnings` clean (if Rust touched)
- [ ] `pnpm test` green
- [ ] `pnpm test:e2e` green (if HUD touched)
- [ ] Manual smoke on at least one OS (state which in PR)
- [ ] No new dependency without ADR
- [ ] CLAUDE.md updated if rules changed
- [ ] No secrets, no audio, no transcripts in logs

## 12. When in doubt

- **Ambiguous request** → ask one clarifying question, don't guess.
- **Two reasonable designs** → present both with trade-offs, let me pick.
- **Conflict with this file** → surface it, propose an amendment.
- **Library you're unsure about** → don't invent APIs; ask me to fetch docs.
