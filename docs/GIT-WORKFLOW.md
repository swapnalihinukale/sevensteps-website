# Save and undo changes

Use [swapnalihinukale/sevensteps-website](https://github.com/swapnalihinukale/sevensteps-website), branch `feat/sevensteps-rebuild`. Edit the current site in `site/`; the older drafts remain in `website/`. Keep `master` unchanged during this work.

## Save a change

From the repository root:

```sh
git branch --show-current
git status --short
git diff
node scripts/check-shareable.mjs
```

Run the checks for the files you changed, then stage those files and commit them with a description of the change. Push the branch:

```sh
git push -u origin feat/sevensteps-rebuild
```

Use your GitHub account with Write access to this repository. AtharvaBondre already has that access for the current development work. Keep credentials out of remote URLs, logs and chat; do not change a shared global login to push from an assistant session.

Open **Actions → Verify Seven Steps** and check the run for your commit. CI builds and tests the site without deploying it. The Netlify configuration skips branch and pull-request deployments.

## Undo a shared commit

```sh
git revert <commit>
```

Review and test the resulting change, then push it to the same branch. A revert preserves the history. Avoid force-pushes or `reset --hard` on shared work. Check later edits before restoring a single file from an older commit.

A code revert cannot undo a database migration or recover deleted enquiries. Follow [the launch and recovery guide](LAUNCH.md) for those cases.

## Keep the review ZIP current

After changing the website, regenerate [the review package](REVIEW-PACKAGE.md) and commit its ZIP and manifest together in `review/`. Keep generated working folders, private photos, credentials and enquiry records out of Git.

Share [the branch link](https://github.com/swapnalihinukale/sevensteps-website/tree/feat/sevensteps-rebuild) for the code, guides and saved review.
