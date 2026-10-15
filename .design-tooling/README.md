# Local design tools

Updated 15 October 2026. **OpenDesign is installed but its runtime is on security hold after the dependency audit.** [The audit and remediation record](DEPENDENCY-AUDIT-2026-10-15.md) distinguishes critical/high findings and actual feature exposure. Project MCP is disabled; launcher `start`, `mcp` and scoped `codex` refuse execution. Offline skills and craft references remain usable for research and design planning.

Earlier lifecycle/protocol checks passed and are preserved as historical evidence, not current security clearance. No photography website has been generated, no OpenDesign model run was submitted, and no global Codex configuration, trust setting, skill or authentication was changed.

## Installed artifacts

- Anthropic `frontend-design` is installed at `../.agents/skills/frontend-design/SKILL.md`, pinned to `anthropics/skills` commit `dbd4588f9e1033efb41dad4bef2f7947c8993d44`. The official Claude plugin snapshot is retained in `vendor/claude-plugins-official/frontend-design`; its skill was byte-identical and has no extra runtime hooks/tools.
- The project adapter is `../.agents/skills/photographer-design-codex/SKILL.md`. It combines the project's evidence and business constraints with selected OpenDesign craft references. Those references include preserved Apache-2.0 and Refero MIT license notices. Reading a reference does not select its styling rules for this business.
- OpenDesign 0.25.0 is checked out at `open-design`, commit `ae8038e7ce12ff305d57d12acbf3001f117cb100`. It is a local application/daemon, CLI and MCP server, not just a skill. The daemon and `tools/dev` build closure completed successfully (12 package builds).
- Node 24.22.0 and pnpm 10.33.2 are installed under `runtime`. System Node was not modified. Codex CLI 0.144.1 was available on this machine.

Source pins, attribution, current file hashes and local punctuation edits are in `SOURCES.json`. The reference text has been edited to remove em dashes; original hashes remain in the edit record. Historical protocol results and the current hold are in `VERIFICATION.json`.

## Lifecycle

Status and stop remain available from the project directory:

```sh
./scripts/design-tooling.sh status
./scripts/design-tooling.sh stop
```

The explicit security hold blocks startup before invoking the upstream launcher. After documented remediation/revalidation, the retained lifecycle implementation uses upstream `pnpm tools-dev` with the `website-design` namespace, port **47841**, explicit localhost binding and a separate developer-runtime directory. Data, SQLite, logs and temporary files remain under `.design-tooling/state/`, which is ignored by Git. Port ownership checks and idempotent startup were verified before the hold.

The launcher uses `env -i` and supplies only the real user home, a controlled executable path, local temporary directory, locale and explicit OpenDesign settings. It does not inherit API keys, provider overrides, telemetry destinations, legacy data imports or global OpenDesign state variables. `--no-env-file` disables repository dotenv loading. Saved metrics/content/artifact telemetry preferences are false and `OPEN_DESIGN_VELA_TELEMETRY=0`. The real home permits normal local CLI discovery; credentials are never copied. This is a source-audited configuration, not a network packet-capture claim.

The daemon is stopped. While held, an MCP connection cannot auto-start it. When a maintainer later lifts the hold following the audit's remediation sequence, the retained MCP implementation starts the daemon on demand and closing MCP leaves it available until `stop`. Nothing registers a login item, scheduled job or global daemon.

## Codex connection and current limitation

`.codex/config.toml` now sets `open_design.enabled = false`; its absolute launcher path and eleven-tool read allowlist are retained for later reviewed use. The allowlist excludes generation, login, brief mutation, creation, writes, deletion and cancellation. OpenDesign itself advertised 22 tools: the read restriction was client configuration, not a server security patch or nonexistent OpenDesign read-only mode. Do not bypass the current runtime hold by launching the raw upstream server.

This machine currently does **not** trust `/Users/admin/Documents/Website` in the global Codex configuration. Plain `codex mcp get open_design --json` therefore returned “No MCP server named 'open_design' found.” The local Codex `config/read` protocol confirmed that the project config layer is disabled for that reason. No trust setting was changed.

Before the security audit, the following process-scoped alternative was verified. It is **currently refused by the launcher** and is retained here only to explain the post-remediation connection path:

```sh
./scripts/design-tooling.sh codex mcp get open_design --json
./scripts/design-tooling.sh codex
```

When re-enabled after remediation, the first command inspects the effective server/allowlist without a model run. The second opens a new Codex CLI session with that configuration; it was not used to submit a task during validation. The launcher reads the owned TOML block, respects its enabled flag and fails on unexpected tool/argument changes. Global model, trust and authentication files remain untouched.

After the security hold is lifted through the documented remediation process, automatic desktop discovery also requires Codex to load the project layer in a normally trusted project session. Existing desktop conversations may require a new turn/session or configuration reload. Do not claim the current desktop conversation has loaded this MCP server merely because the config exists. The CLI route and direct MCP protocol were historically verified; automatic desktop discovery was not. If the workspace is moved, update the absolute `command` path in `.codex/config.toml`.

## Historical verification and current limits

Do not rerun the protocol verifier while the security hold is active: refusal is now expected. These are the retained post-remediation verification commands:

```sh
.design-tooling/runtime/node_modules/node/bin/node scripts/design-tooling-verify.mjs
./scripts/design-tooling.sh stop
```

The check exercises cold MCP startup, initialization, tool listing, a `list_skills` call, resource discovery, health/privacy settings, and idempotent lifecycle startup. It asserts protocol-only stdout; launcher diagnostics go to stderr. It writes a compact report without catalog contents, credentials or user projects. The test leaves the daemon running so `stop` is explicit.

Observed: daemon health succeeded; analytics disabled; metrics/content disabled; MCP identified `open-design` protocol-server version 0.2.0 (distinct from app version 0.25.0); 22 advertised upstream tools; eleven configured read tools; nonempty skill catalog; 323 resources. Successful stop and a closed listener were also verified. No projects were created and no model or website generation was used as a health check.

Dependency installation reported ignored build scripts for `@ffmpeg-installer/darwin-arm64`, `@ffprobe-installer/darwin-arm64`, `@google/genai` and `node-pty`. They were not approved merely to remove a warning. Core daemon/SQLite and discovery worked. Media conversion, terminals, providers, generation, the web UI and Electron app were not validated. Some bundled “skills” are short pointers to upstream projects; their presence is not proof that every upstream workflow is installed.

Before any future OpenDesign generation, reassess its active provider, model cost, project permissions and Codex integration. The current source can normalize invalid Codex `service_tier` values on an actual run. Setup validation avoids that path. Cloud login, publishing, connectors and business accounts are unconfigured. Tool installation is not authorization to code or publish the photography website.

## Recorded installation, not a remediation recipe

The commands below document how the ignored checkout/dependencies were installed. **They reproduce currently flagged pins and are not the recommended next action.** Select and document the remediation versions first; preserve data that needs keeping. Historical commands assume the checkout is absent and run from this project's root:

```sh
npm ci --prefix .design-tooling/runtime --no-audit --no-fund
git clone --filter=blob:none --no-checkout https://github.com/nexu-io/open-design.git .design-tooling/open-design
git -C .design-tooling/open-design checkout --detach ae8038e7ce12ff305d57d12acbf3001f117cb100
env -i HOME="$HOME" \
  PATH="$PWD/.design-tooling/runtime/node_modules/.bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin" \
  OPEN_DESIGN_POSTINSTALL_TARGETS='["apps/daemon","tools/dev"]' \
  pnpm --dir .design-tooling/open-design install --frozen-lockfile
```

The build-target setting narrows the build closure; it does not guarantee a small dependency download. Installation fetches public packages and platform binaries. No `corepack enable`, global package installation, OpenDesign curl installer or `od mcp install codex` is needed. Source checkout, dependency and runtime upgrades require a fresh audit and verification; the launcher rejects an unexpected OpenDesign commit. Follow the dependency audit to lift the hold; editing ignored state or an environment variable cannot unlock it.
