# State-of-the-Art Conventions — Rust · Tauri · TypeScript + React
> Reference guide (2026). Opinionated, production-grade defaults.
> Companion to `CLAUDE.md`. Where the two disagree, `CLAUDE.md` wins (project-specific).
---
## Table of Contents
1. [Rust](#1-rust)
2. [Tauri v2](#2-tauri-v2)
3. [TypeScript](#3-typescript)
4. [React](#4-react)
5. [The Tauri ⇄ Frontend boundary](#5-the-tauri--frontend-boundary)
6. [Tooling & CI](#6-tooling--ci)
---
## 1. Rust
### 1.1 Editions & toolchain
- Pin the toolchain with `rust-toolchain.toml` (`channel = "stable"`, list components).
- Use the latest stable edition. Enable `resolver = "2"` in the workspace.
- `cargo clippy -- -D warnings` is non-negotiable in CI.
### 1.2 Error handling
- **Libraries**: typed errors with `thiserror`. Each crate exposes its own `Error` enum.
- **Binaries / app glue**: `anyhow::Result` with `.context("…")` on every fallible call.
- **Never `unwrap()`** outside tests. `expect("reason")` only with a justification.
- Prefer `?` propagation; convert at boundaries with `#[from]`.
```rust
#[derive(Debug, thiserror::Error)]
pub enum AudioError {
    #[error("no input device available")]
    NoDevice,
    #[error("stream build failed: {0}")]
    Stream(#[from] cpal::BuildStreamError),
}
```
### 1.3 Ownership & API design
- Take `&str` / `&[T]` in function signatures, return owned `String` / `Vec<T>`.
- Accept `impl Into<String>` / `impl AsRef<Path>` for ergonomic call sites.
- Make illegal states unrepresentable — use enums over boolean flags.
- Newtype wrappers for domain IDs (`struct SessionId(Uuid)`), never raw `String`.
### 1.4 Concurrency
- `tokio` for async; one runtime, created at startup.
- Share state with `Arc<Mutex<…>>` only when truly shared; prefer message passing
  (`tokio::sync::mpsc`) for actor-style components.
- `tokio::sync::Mutex` in async contexts, `std::sync::Mutex` for sync-only.
- `parking_lot::Mutex` when you want a faster, no-poison sync mutex.
### 1.5 Testing
- Unit tests in-file under `#[cfg(test)] mod tests`.
- Integration tests in `tests/`.
- `cargo nextest run` for speed in CI.
- Property tests with `proptest` for parsers / serializers.
### 1.6 Modules & visibility
- `pub(crate)` by default; expose the minimum surface.
- One concept per module. Re-export the public API from `lib.rs` / `mod.rs`.
- No `mod.rs` mega-files — prefer `foo.rs` + `foo/` sibling layout.
---
## 2. Tauri v2
### 2.1 Security posture (most important)
- **Capabilities over allowlist** — Tauri v2 uses a permission/capability system.
  Grant the narrowest set in `capabilities/*.json`.
- Disable everything you don't use. No `shell:allow-execute` unless required.
- Scope `fs` permissions to specific directories (`$APPCONFIG`, `$APPDATA`), never `**`.
- CSP locked down in `tauri.conf.json` — no `unsafe-inline`, no wildcard sources.
- Secrets in OS keychain via `tauri-plugin-stronghold` or `keyring` crate, never in
  config files, never in `localStorage`.
### 2.2 Commands (IPC)
- Commands are the only bridge. Keep them thin — validate, delegate to a service, return.
- Always `async`. Return `Result<T, E>` where `E: Serialize` so the frontend gets typed errors.
- Take `State<'_, T>` or `AppHandle`, never global statics or `lazy_static`.
- Name commands `verb_noun` (`start_session`, `transcribe_buffer`).
```rust
#[tauri::command]
async fn transcribe_buffer(
    state: tauri::State<'_, AppState>,
    audio: Vec<u8>,
) -> Result<TranscriptDto, ApiError> {
    state.stt.transcribe(audio).await.map_err(Into::into)
}
```
### 2.3 Events
- Backend → frontend streaming via `app.emit` / `emit_to`.
- Strongly type event payloads; share the type with the frontend (see §5).
- Always clean up listeners on the frontend (`unlisten()` in effect cleanup).
### 2.4 State
- One `AppState` struct registered with `.manage()` at setup.
- Wrap mutable fields in `Mutex` / `RwLock`; keep the struct `Send + Sync`.
### 2.5 Plugins
- Prefer official plugins (`global-shortcut`, `updater`, `stronghold`, `opener`).
- Each plugin's permissions must be explicitly granted in capabilities.
### 2.6 Sidecars & binaries
- Bundle external binaries as sidecars declared in `tauri.conf.json`.
- Verify checksums; pin versions.
### 2.7 Updates & signing
- `tauri-plugin-updater` against a signed static manifest.
- Code-sign per platform (Apple Developer ID notarization, Windows Authenticode).
- Generate and protect the update signing keypair; public key in config, private key in CI secrets.
---
## 3. TypeScript
### 3.1 Compiler config (strict-max)
```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "skipLibCheck": true
  }
}
```
### 3.2 Type system
- **No `any`.** Use `unknown` + narrowing, or generics. Each `as` cast carries a comment.
- **No `enum`** — use `as const` objects + derived unions:
  ```ts
  const Status = { Idle: 'idle', Recording: 'recording' } as const;
  type Status = (typeof Status)[keyof typeof Status];
  ```
- **Discriminated unions** for every multi-state value (results, events, machine states).
- `type` for unions/intersections/aliases; `interface` only for extendable object shapes
  (or public contracts meant to be implemented).
- **Branded types** for domain primitives: `type UserId = string & { __brand: 'UserId' }`.
- **`satisfies`** to validate object literals without widening.
- Validate all external data (network, disk, IPC) with **Zod** at the boundary; infer
  static types from schemas, never duplicate.
### 3.3 Style
- Shorthand-first: object shorthand, arrow functions, optional chaining, `??`, destructuring.
- Prefer `const`; `let` only when reassigned; never `var`.
- Named exports over default (except framework-required default like a React page).
- Imports sorted: external → alias (`@/…`) → relative. Let Biome handle it.
- Filenames `kebab-case.ts`; one primary export per file.
### 3.4 Errors
- `Result<T, E>` at module boundaries; throw only for programmer errors (invariants).
  ```ts
  type Result<T, E> =
    | { ok: true; value: T }
    | { ok: false; error: E };
  ```
- Never throw raw strings. Error objects carry a discriminant.
### 3.5 Async
- `async/await` over raw `.then` chains.
- Always handle `AbortSignal` for cancellable work (fetch, long tasks).
- No floating promises — `await`, `void`, or `.catch` every one.
---
## 4. React
### 4.1 Components
- Function components only. No classes.
- Keep components presentational; push logic into hooks and stores.
- Co-locate: `component.tsx`, `component.test.tsx` in the same folder.
- Props typed explicitly; no `React.FC` (it implies hidden `children`).
### 4.2 State management hierarchy
Pick the **lowest** tier that works:
1. Local `useState` / `useReducer` for component-local state.
2. URL / route state for shareable, navigable state.
3. **Zustand** for cross-component app state (slices per concern).
4. **TanStack Query** for server/async cache state (if a backend is involved).
Never duplicate server state into a client store.
### 4.3 Hooks discipline
- Rules of Hooks: top level, never conditional.
- `useEffect` is a **last resort** — it's for synchronizing with external systems
  (subscriptions, DOM, Tauri listeners), not for deriving data.
- Derive during render; memoize with `useMemo` only after measuring.
- Stable, semantic keys in lists — never the array index.
- Custom hooks: prefix `use`, return a stable shape (object or tuple).
### 4.4 Performance
- Measure before optimizing (React DevTools Profiler).
- `React.memo` / `useCallback` only where a real re-render cost exists.
- Code-split heavy routes/components with `lazy` + `Suspense`.
- Virtualize long lists (`@tanstack/react-virtual`).
### 4.5 Styling
- Tailwind v4 utility-first; extract repeated patterns into components, not `@apply` soup.
- `cn()` helper (clsx + tailwind-merge) for conditional classes.
- shadcn/ui as the component base; own the code, customize freely.
- Design tokens via CSS variables; support light/dark via `data-theme`.
### 4.6 Accessibility
- Semantic HTML first; ARIA only to fill gaps.
- Every interactive element keyboard-reachable and focus-visible.
- Label all inputs; announce async status to screen readers (`aria-live`).
### 4.7 Forms
- `react-hook-form` + `zod` resolver. Schema is the single source of truth.
- Validate on blur/submit, not on every keystroke.
---
## 5. The Tauri ⇄ Frontend boundary
The boundary is where type safety usually leaks. Close it.
### 5.1 Share types, don't duplicate
- Generate TS types from Rust with **`tauri-specta`** (or `ts-rs`). One source of truth.
- This gives typed `invoke` wrappers and typed event payloads automatically.
```ts
// generated by tauri-specta — do not edit by hand
export const commands = {
  async startSession(): Promise<Result<SessionId, ApiError>> { /* … */ },
};
```
### 5.2 Validate at the seam anyway
- Even with generated types, parse IPC results with Zod if the data crosses a trust
  boundary (e.g. plugin output, sidecar stdout).
### 5.3 Errors cross typed
- Rust command `Err(E)` where `E: Serialize` → frontend receives a typed object.
- Map to the frontend `Result` discriminated union; never `catch` into `any`.
### 5.4 Events
- Type event names as a `const` map; type payloads via the shared/generated types.
- Wrap `listen` in a typed helper that returns the `unlisten` for effect cleanup.
```ts
useEffect(() => {
  const p = listenTyped('transcript', (e) => setText(e.payload.text));
  return () => { void p.then((un) => un()); };
}, []);
```
### 5.5 Heavy work belongs in Rust
- Audio capture, VAD, file I/O, crypto, CPU-bound transforms → Rust.
- The frontend orchestrates and renders; it does not crunch.
---
## 6. Tooling & CI
### 6.1 One tool per job
| Job | Tool |
|---|---|
| TS/JS lint + format | **Biome** (replaces ESLint + Prettier) |
| Rust lint | **Clippy** (`-D warnings`) |
| Rust format | **rustfmt** |
| TS type check | `tsc --noEmit` |
| Unit tests (TS) | **Vitest** |
| E2E | **Playwright** |
| Rust tests | **cargo nextest** |
| Package manager | **pnpm** |
| Dead code (TS) | **Knip** |
### 6.2 Pre-commit / pre-push
- Hooks via `lefthook` or `husky`: run Biome + tsc on staged files, clippy on Rust changes.
- Keep hooks fast (< 5 s); push the slow suite to CI.
### 6.3 CI matrix
- Build & test on `ubuntu-latest`, `macos-latest`, `windows-latest`.
- Cache cargo registry/target and pnpm store.
- Required gates: lint, typecheck, unit, clippy, build artifacts. E2E on PRs touching UI.
### 6.4 Dependency hygiene
- `pnpm` with a committed lockfile; `cargo` with `Cargo.lock` committed (it's an app).
- `cargo audit` + `pnpm audit` in CI on a schedule.
- Renovate/Dependabot for updates; review, don't auto-merge majors.
### 6.5 Conventional Commits
- `type(scope): subject`. Enforce with commitlint.
- Drives changelog generation and semantic versioning.
---
## Quick checklist before opening a PR
- [ ] `pnpm biome check .` clean
- [ ] `pnpm tsc --noEmit` clean
- [ ] `cargo clippy -- -D warnings` clean
- [ ] `cargo fmt --check` clean
- [ ] `pnpm test` + `cargo nextest run` green
- [ ] No `any`, no `enum`, no `unwrap()` in shipped code
- [ ] IPC types generated, not hand-written
- [ ] Capabilities grant only what's used
- [ ] No secrets / audio / PII in logs
- [ ] Conventional commit messages
