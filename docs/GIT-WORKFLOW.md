# Repository and reversible changes

The working repository is `swapnalihinukale/sevensteps-website`. All project changes use one branch, `feat/sevensteps-rebuild`, based on the existing `master` history. The original three HTML files remain under `website/`; the new application lives under `site/`.

The initial local commit imports the private Astro build, research, design guidance, verification evidence and pinned dependencies. Further commits add the enquiry backend and its tests. Preserve the commits when pushing. Do not merge into `master` or force-push a shared branch.

## Access confirmed

On 15 October 2026, both signed-in accounts, `AtharvaBondre` and `AtharvaBondreScoutflo`, had READ permission. Later in this session, the user confirmed access and a fresh permission check verified WRITE for AtharvaBondre. Use that account for the branch push. AtharvaBondreScoutflo remains READ. No fork replaces the supplied repository.

Message to send:

> Hi Swapnali, the website work has started. Please add my GitHub account **AtharvaBondre** as a collaborator on **swapnalihinukale/sevensteps-website** so I can save our changes on a separate branch. Open the repository, then Settings, Collaborators, Add people. Search for AtharvaBondre and send the invitation. If GitHub shows a role selector, choose Write. Let me know when you have sent it so I can accept. I will keep master unchanged. You do not need to share your password, token or hosting credentials.

Personal repository collaborators may receive write access without a separate role selector. GitHub may require the owner to reauthenticate. The invited user must accept through GitHub before the permission becomes effective.

## Saving and undoing work

Check the branch and diff before each commit:

```sh
git branch --show-current
git status --short
git diff
node scripts/check-shareable.mjs
```

After access is confirmed, push the existing branch with `git push -u origin feat/sevensteps-rebuild`. Use the invited account for this repository without changing a shared global login. Check remote commit identity after pushing. Do not print credentials or embed them in a remote URL.

Undo an individual completed change with `git revert <commit>` on this branch. A revert creates another commit and preserves history. Review the diff and rerun the relevant checks. Do not use `reset --hard`, delete the branch, or force-push to undo shared work. Restore a particular file from an earlier commit only after checking for later changes that need preservation.

The Netlify configuration skips branch and pull-request preview builds. The backend also requires explicit production activation settings. Confirm production account preview settings before adding any personal enquiry data. The CI workflow runs validation and synthetic local tests; it does not deploy or send mail.

The shareable-file check excludes secrets and private runtime paths. An earlier browser report included process environment variables. The import commit contains a redacted report, and the browser configuration now uses an allowlist of harmless environment names. Local `.local` databases, keys and generated runtime state stay outside Git.
