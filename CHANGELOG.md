# Changelog

All notable changes to this project are documented in this file.
## [0.2.0] - 2026-05-30

### Features

- *(tauri)* Add system tray with show/hide and quit actions
## [0.1.2] - 2026-05-30

### Bug Fixes

- *(tauri)* Unify app data dir by using plain identifier
## [0.1.1] - 2026-05-30

### Bug Fixes

- *(ci)* Exclude .claude directory from Biome and git

### Miscellaneous

- Cleanup
- Release test
## [0.1.0] - 2026-05-30

### Bug Fixes

- *(core)* Sort imports and use node: protocol to satisfy biome
- *(ci)* Pin pnpm version so action-setup can install it
- *(ci)* Resolve pre-existing Biome violations
- *(tauri)* Add app icons referenced by bundle config
- *(ci)* Let nextest pass when the rust crate has no tests yet
- Release tag
- *(release)* Handle initial version tagging when no tags exist

### CI/CD

- Add Rust, Tauri, and React CI/CD workflows
- Add commitlint, git-cliff changelog, and release-on-main

### Features

- *(hud)* Build recording widget with live waveform and controls

### Miscellaneous

- Scaffold M0 project structure
- Rename project voxbar → whisperium + add CONVENTIONS.md
- *(ci)* Enforce conventional commits via commitlint
- *(ci)* Add git-cliff changelog and auto-release on main
- *(deps)* Update JS dependencies to latest within-major versions

