# Site dependency and runtime evidence

15 October 2026. This record covers the new private Astro site. It does not clear the separate OpenDesign runtime or certify the website for public release. The root agent installed these packages with `--ignore-scripts`; this review executed no dependency lifecycle scripts or rebuilds.

## Exact choices

| Package | Pin | Licence / purpose |
|---|---|---|
| `astro` | `7.3.8` | MIT; static page/content build |
| `typescript` | `6.0.3` | Apache-2.0; type checks |
| `@types/node` | `22.20.5` | MIT; Node 22 build/test type declarations |
| `@astrojs/check` | `0.9.10` | MIT; Astro template diagnostics |
| `@playwright/test` | `1.64.1` | Apache-2.0; browser test runner |
| `@axe-core/playwright` | `4.13.0` | MPL-2.0; automated accessibility checks |
| `@fontsource-variable/source-serif-4` | `5.3.1` | OFL-1.1; heading font assets |
| `@fontsource-variable/source-sans-3` | `5.3.1` | OFL-1.1; reading/control font assets |

The agent checked the official npm registry metadata for engines, peer ranges, licences and upstream repository identities. Astro requires Node `>=22.12.0` and npm `>=9.6.5`. The host uses **Node 22.23.2 and npm 10.9.8** on macOS ARM64. TypeScript 7.0.2 was the registry's latest release during preflight, but Astro check 0.9.10 declares TypeScript `^5.0.0 || ^6.0.0`; the project therefore pins 6.0.3. Axe's Playwright wrapper resolves its compatible axe-core 4.13.0 dependency without adding a duplicate direct axe-core package.

The [engine check](audits/2026-10-15-engine-check.json) compared **117 declared Node/npm constraints** from installed packages with this host using installed semver 7.8.5. All matched. Packages without engine declarations remain visible in the inventory; absence of a declaration is not evidence of compatibility. Application build and browser checks remain separate.

## Resolved lockfile audits

Evidence for lockfile SHA-256 `87c3c86461cba7994c89546b4fceef0c319d43588bffc27edeb1e86d146fc4ad`:

- [Full npm audit](audits/2026-10-15T06-56-55Z-npm-audit-full.json): successful query, exit 0, **0 reported vulnerabilities**.
- [Production-subset npm audit](audits/2026-10-15T06-56-55Z-npm-audit-production.json): successful query, exit 0, **0 reported vulnerabilities**.
- [Dependency, licence, lifecycle and secret-scan inventory](audits/2026-10-15T06-56-55Z-dependency-report.json): **345 non-root lock records**, **277 installed**, **68 absent optional platform records**. The lock did not change during the report. All eight direct exact pins matched; the agent found no missing required installation, installed-version mismatch, missing licence field or missing official-registry URL/integrity metadata.

The inventory classifies 81 records as dev-only and 264 as non-dev, including optional platform packages. These are lockfile classifications, not browser payload counts. npm's audit summary uses its own overlapping dependency categories. The full and production commands report the same installed dependency-count metadata; their vulnerability queries use the recorded command scopes.

The query reports known advisories available through npm at that time. It does not prove that no vulnerability exists. A production-only result would not clear an exposed build/test dependency. Follow the project's [quality/security gates](../../docs/QUALITY-AND-SECURITY-GATES.md) if findings appear: inspect the exact path, affected behavior and reachability, fix applicable critical/high issues, and document any permitted temporary exception. Do not use `npm audit fix --force` as a substitute for that review.

## Lifecycle and native dependencies

The inventory records 25 lifecycle-related package entries: 24 with `prepare` commands and one `hasInstallScript` lock flag for fsevents 2.3.3. The installed manifests contain no explicit `preinstall`, `install` or `postinstall` commands. Prepare commands in published registry dependencies describe package development/publishing; git/local installs have different behavior. Do not execute those commands to make this application work.

The agent inspected fsevents' manifest and loader. The published package includes `fsevents.node`; the installed manifest has no install command. [Native smoke evidence](audits/2026-10-15-native-smoke.json) records:

- fsevents loaded its bundled binding; the agent did not start a watcher.
- Lightning CSS transformed synthetic CSS in memory.
- Sharp encoded and decoded a synthetic 2×2 WebP in memory.

These checks passed without a rebuild. They establish those loading/operation paths, not photographer-image quality or the complete Astro build. Sharp resolved to 0.35.5 through Astro's optional dependency range; the inventory retains exact native/platform versions.

## Licence treatment

The complete lock inventory contains **no unknown licence fields**. It records 263 MIT, 20 Apache-2.0, 14 ISC, 14 MPL-2.0, 10 LGPL-3.0-or-later, two OFL-1.1 and the remaining BSD, BlueOak, CC0 and combined licence expressions. Preserve the exact expressions in the JSON inventory rather than flattening mixed terms into a permissive label.

Keep these uses distinct:

- Distribute the two fonts with their original OFL notices. Their installed package `LICENSE` files supply those notices. Check the built font assets and notices before any public release.
- Axe is a test dependency. Lightning CSS and Sharp/libvips serve the build. MPL/LGPL obligations need review if someone distributes modified covered files, native binaries or a tooling image. They do not make the static site's original content subject to those licences by association.
- The native libvips package declares LGPL-3.0-or-later but has no top-level notice file matching the inventory's filename check. Retain this source/licence reference and inspect upstream notices before redistributing that binary. The current plan does not serve native build binaries to visitors.

A known licence field is an inventory result, not a blanket legal clearance. Recheck the distribution contents if the delivery model changes.

## Font budget

Use the normal Latin weight-axis files, not Serif's default optical-size file:

| File in the pinned package | Bytes |
|---|---:|
| `source-serif-4-latin-wght-normal.woff2` | 50,936 |
| `source-sans-3-latin-wght-normal.woff2` | 28,872 |
| **Combined** | **79,808 bytes / 77.94 KiB** |

Both support weights 200–900. The agent read the registry tarballs in memory and matched their SHA-512 hashes to registry metadata during preflight. These figures describe the two font files, not an observed browser transfer. Importing Serif's `standard`/`opsz` normal asset would request a 122,360-byte file before the Sans font, exceeding the 100 KiB font budget.

Reference the intended files, use swap/fallback behavior and avoid adding unused styles or broad subset imports. Latin excludes Marathi and the rupee glyph. Use a suitable system fallback for missing glyphs and check actual text; additional language/font subsets require a revised measured total. Preserve accurate names rather than deleting characters to fit a subset.

## Narrow secret scan

The inventory's scan found **0 pattern matches across 46 text files** at the recorded snapshot. It checked site source, public assets, scripts, tests, root text/config files and built output when present. This refresh included built `dist` output. Earlier snapshots remain in the audit folder. It excluded node_modules, other workspace projects and generated audit records. Matches would contain a path, line and rule name, without copying the suspected value.

The patterns cover private-key markers, recognised GitHub/npm/AWS token shapes and credential-bearing URLs. They cannot detect all secrets or private information. Rerun the report if the final candidate adds or changes source/build files; also inspect the built public/review boundary.

## Commands and artifact budget

Run from `site`:

```sh
node scripts/dependency-report.mjs
npm run build
npm run budget
```

The dependency report retains dated full/production audit JSON, exact lock hash, package inventory, lifecycle commands, licence counts and redacted secret findings under `docs/audits`. It exits nonzero for failed scans, reported advisories, unresolved inventory checks or secret-scan findings/gaps. Review that evidence before deciding whether a finding applies; the script does not assign vulnerability reachability.

The budget checker writes `docs/audits/budget-latest.json` and a dated snapshot for the current `dist` artifact. It checks conservative totals: all gzip CSS against 30 KiB, all gzip JavaScript against 80 KiB, the largest gzip HTML file against 35 KiB and all emitted fonts against 100 KiB. It also compares their sum with the 350 KiB shell allowance. It fails exceeded limits and records per-file hashes/sizes with an artifact fingerprint.

That shell sum excludes photographs and third-party requests. A pass cannot establish the complete 350 KiB critical transfer, 900 KiB cold entry, image quality or Core Web Vitals. All-dist totals include route-specific/deferred code, so a failure may require an examined request graph rather than a silent threshold increase. Use browser/network evidence for the actual entry and story budgets. The [06:56:55 UTC artifact snapshot](audits/2026-10-15T06-56-55Z-budget-3bc8b362887c.json) passed: CSS 6.35 KiB gzip, JavaScript 2.94 KiB gzip, largest HTML 6.78 KiB gzip, fonts 77.94 KiB, and shell 94.00 KiB. The largest HTML file was the content checklist. The image inventory contained one small SVG, so these figures do not establish a photography-page performance result. Rerun after changing the build or adding real assets.

The [budget-checker smoke test](audits/2026-10-15-budget-checker-smoke.json) verified its CLI gate with synthetic byte fixtures: a 100 KiB font entry passed, and one byte above the ceiling returned exit 1. The agent removed the temporary fixtures. This test checks the size gate, not a real font's validity or rendering.

## Local preview measurement

Run `node scripts/preview-measure.mjs` against the loopback preview at port 4321. The script uses the installed Playwright Chromium in a fresh context, a 390×844 CSS-pixel viewport, disabled cache, 150 ms CDP latency, 1.6 Mbps download, 0.75 Mbps upload and uncalibrated 4× CPU slowdown. It samples for ten seconds from navigation start and includes Navigation Timing alongside completed Resource Timing entries. It records transfer, encoded-body and decoded-body sizes, in-flight requests, browser version, observed LCP and session-window CLS.

The script blocks and records attempted external or media requests. It captures the home, wedding story and content checklist at 390×844 and 1440×1000, both viewport and full-page images. Additional routes use unthrottled contexts and are visual evidence only. Use `node scripts/preview-measure.mjs --screenshots-only` to refresh captures without making a performance sample. Reports go to `docs/audits` and images to `docs/screenshots`. It performs no form submission. Its output remains placeholder-only synthetic evidence; it does not measure INP, a physical phone, field performance or real-photography loading. Inspect missing/zero-sized timing entries and development-server detection before interpreting totals.

The [06:56:55 UTC final-candidate run](audits/2026-10-15T06-56-55Z-preview-measure.json) used Chromium 156.0.8078.4 after the root agent's clean install and 12:23:35 IST review build. Five requests accounted for 95,664 bytes of reported transfer, 94,164 encoded-body bytes and 141,427 decoded-body bytes. It observed placeholder LCP at 948 ms and CLS 0.06364. It recorded no in-flight request, prohibited external/media request, player element, page error or development client. The [initial sample](audits/2026-10-15T06-50-55Z-preview-measure.json) had the same homepage byte totals but different timings; these are individual samples, not a distribution or guarantee.

The report links twelve screenshots, including the full [wedding story at desktop](screenshots/2026-10-15T06-56-55Z-wedding-desktop-1440-full.png) and [mobile](screenshots/2026-10-15T06-56-55Z-wedding-mobile-390-full.png), and the [content checklist at desktop](screenshots/2026-10-15T06-56-55Z-checklist-desktop-1440-full.png) and [mobile](screenshots/2026-10-15T06-56-55Z-checklist-mobile-390-full.png). Captured document widths matched their 390/1440 CSS-pixel viewports. The [served-body identity check](audits/2026-10-15-final-served-identity.json) matched all three route bodies to the current dist files by SHA-256. This visual sample is separate from the root agent's interaction, accessibility and cross-browser tests. Any subsequent source/build change needs the relevant checks repeated.

## Final-candidate checks owned by the root agent

| Check | Expected result | Current evidence boundary |
|---|---|---|
| Clean install | Use Node 22.23.2/npm 10.9.8 and `npm ci --ignore-scripts` after coordinating the active workspace. The lock remains unchanged, required packages resolve, and checks/build/tests pass. | Root evidence: [clean install](audits/clean-install.log) added 277 packages in three seconds; [check](audits/final-check.log) reported zero diagnostics across 27 files; [unit tests](audits/unit-tests.log) passed 19 of 19. The refreshed lock hash matches the earlier inventory. |
| Public wrapper gate | `npm run build:public` returns nonzero while required content and public delivery remain unresolved. It must not leave the old review artifact available for deployment. | Root's [refusal record](audits/public-build-refusal.json) shows exit 1, removal of previous review output and no public output. |
| Direct Astro gate | A direct Astro build with `PUBLIC_SITE_MODE=public` must also refuse public output. | The same refusal record shows direct Astro exit 1. Missing content and undecided public features remain explicit. |
| Final refresh | Rebuild review output after the public refusal, then refresh the dependency report, artifact budget and preview measurement. | Root's [review build](audits/final-build.log) completed at 12:23:35 IST and passed the copy check. The 06:56:55 UTC reports above cover that candidate. Later changes require another relevant verification pass. |

These checks validate the private/public boundary. They do not authorise publication, live enquiry integration or domain/account changes.

## Final private candidate refresh

The final browser run at 07:14:00Z passed 51 of 51 cases across Chromium, Firefox and WebKit. The final 07:15:35Z full/production dependency audits both returned zero advisories against the same locked tree. The final artifact budget is CSS 6.34 KiB gzip, JavaScript 3.03 KiB gzip, largest HTML 6.78 KiB gzip and fonts 77.94 KiB, for a conservative 94.08 KiB shell. The 07:15:22Z placeholder-only sample transferred 95,730 bytes over ten seconds with no external or player requests. See the workspace implementation ledger and dated audit files for exact identity and limits.

## Local B03 dependency refresh

The local backend adds @netlify/database 2.0.1, @netlify/functions 6.0.2 and Resend 6.33.0, with pg 8.16.3 and @types/pg 8.15.6 for tests. All versions are exact pins in the site lockfile. These dependencies stay outside the static browser bundle. The clean install uses lifecycle scripts disabled; native PostgreSQL is an isolated local test prerequisite.

The 10:35:48Z dependency report inventories 372 locked packages, 304 installed packages and 68 optional platform packages not installed. Full and production audits contain zero known advisories, with no unresolved pins, integrity or licence records. Its source scan reports zero credential-pattern findings. See the dated audit JSONs and the B03 summary for current test identities. The OpenDesign runtime remains separate and on hold.

Independent review corrected unsafe duplicate database TLS query parameters, inherited driver selection, reload retry recovery, cleanup failures, a production build default and shareable report handling. These fixes supplement package auditing; an advisory scan alone does not establish application safety.
