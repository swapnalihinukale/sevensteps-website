# Firefox launch diagnosis

15 October 2026. Bounded local diagnosis of the Playwright Firefox launch failure. No application code, test configuration, security settings, signatures or existing user profiles were changed by this diagnostic task.

## Result

The launch blocker is resolved by setting `MOZ_APP_DATA` and `MOZ_LOCAL_APP_DATA` to pre-created, writable task-only directories in the Firefox child process. This isolates Firefox's application-data initialization as well as its test profile.

The full Firefox confirmation run reached the site: **16 tests passed, 1 failed, 0 skipped**, in 25.8 seconds. The remaining failure is a motion assertion at line 50 of [journeys.spec.ts](../../tests/browser/journeys.spec.ts): after focusing Play and pressing Enter, `aria-pressed` stayed `false` instead of becoming `true`. It is separate from the earlier launch failure and has been handed to the implementation task.

Evidence:

- [Confirmation log](firefox-confirmation.log)
- [Playwright JSON result](firefox-confirmation.json)
- [Exact process environment](firefox-confirmation-environment.json)
- [Earlier failed launch run](firefox-tests.log)
- [Earlier TMPDIR-only attempt](firefox-profile-probe.log)

The earlier Firefox test failures occurred before navigation. They were environment failures, not evidence that those 17 site journeys failed.

## Environment and checks

- macOS 27.0.1, build 26A434, ARM64; Node 22.23.2.
- Playwright Firefox revision 1555, Firefox 157.0, native ARM64 executable. The installed package's dry-run command identified the official archive as <https://cdn.playwright.dev/dbazure/download/playwright/builds/firefox/1555/firefox-mac-arm64.zip>.
- The installed Playwright platform calculation maps the host to its latest macOS platform entry and does not reject it. These checks do not establish that macOS 27 has been separately certified by upstream.

Three bounded hypotheses were considered:

| Hypothesis | Check | Finding |
|---|---|---|
| The supplied test profile is missing or inaccessible | Pre-created profiles with owner UID 501 and mode 0700 under canonical `/private/tmp` and the user's `Library/Caches`; both paths existed before and after launch | Both failed with the same message before navigation. Changing the profile location alone did not fix it. |
| Inherited browser environment or an incompatible/damaged build | No inherited `MOZ_` or `XRE_` variables; inspected ARM64 executable, browser version and installed platform logic | No concrete unsupported-platform finding. Strict codesign verification reported missing sealed resources on the ad hoc, linker-signed bundle, but the same unchanged binary subsequently launched successfully. That observation is not established as the cause. |
| Firefox application-data initialization fails before selecting the explicit profile | Set `MOZ_APP_DATA` and `MOZ_LOCAL_APP_DATA` to dedicated directories for the child process | The unchanged browser launched, opened a local data page and then executed all 17 site tests. This is the verified workaround. |

## Exact confirmation setup

The confirmation process used these directories, each pre-created with mode 0700:

- `MOZ_APP_DATA=/private/tmp/seven-steps-firefox-confirmation-7qVw3F/app-data`
- `MOZ_LOCAL_APP_DATA=/private/tmp/seven-steps-firefox-confirmation-7qVw3F/local-data`

It ran the Firefox project with one worker, line and JSON reporters, and test artifacts under `/private/tmp/seven-steps-firefox-confirmation-7qVw3F/test-results`. The environment variables affected only that process and its children. A repeatable test setup should create fresh task-only directories rather than rely on these temporary paths surviving.

The isolated startup probes and their JSON evidence are under `/private/tmp/seven-steps-firefox-diagnosis-abtAjD`. A second unsuccessful location probe used `/Users/admin/Library/Caches/seven-steps-firefox-diagnosis-O67VMB/profile`. These are disposable diagnostic directories, not existing user profiles.

## Source explanation and limits

Mozilla's current [profile service source](https://github.com/mozilla-firefox/firefox/blob/main/toolkit/profile/nsToolkitProfileService.cpp) initializes application and local data directories before selecting a profile. Its [directory provider source](https://github.com/mozilla-firefox/firefox/blob/main/toolkit/xre/nsXREDirProvider.cpp) accepts `MOZ_APP_DATA` and `MOZ_LOCAL_APP_DATA` before using the native macOS directory-discovery path. Both were read on 15 October 2026 to identify the isolation options.

This source reading explains why changing only `-profile` or `TMPDIR` could leave the failure intact. The diagnostic did not instrument the exact native call or establish an upstream macOS bug. The verified conclusion is limited to this build and host: isolating both application-data directories allowed Firefox to start and the site tests to run.
