# Show the current version to the photographer

The current handoff stays in the Git repository, as the user requested. Share [the branch](https://github.com/swapnalihinukale/sevensteps-website/tree/feat/sevensteps-rebuild). The committed [review folder](../review/README.md) contains the checked ZIP and manifest; the same branch holds all source, skills and maintenance guides. No hosting action is part of this handoff.

For a later hosted review, use a separate Netlify site with the packaged placeholder website. The photographer can then open its HTTPS link on their own phone or computer without installing the stack. Keep the current domain and existing sites until the later launch decision. The instructions below describe that optional next step.

The present `http://127.0.0.1:4321/` address works only on the computer running it. Sending that address will not show the site on someone else's device. The repository contains source and instructions, but a GitHub link is not a hosted website.

## Prepare the exact version

From `site/`, with the pinned runtime installed:

```sh
npm run check
npm run build
npm run test:review-package
npm run package:review
npm run preview:review-package
```

The last command opens a loopback server at `http://127.0.0.1:4325/`. It uses the same checked static bytes and security headers as the upload. Restart it after rebuilding. This is a local header check, not proof of Netlify's effective hosting configuration.

The upload is `site/.review-package/owner-review.zip`. The folder alternative is `site/.review-package/upload/`. The [package guide](REVIEW-PACKAGE.md) describes the guards and manifest. Keep `manifest.json` outside the hosted folder as delivery evidence. Nothing in this command sequence publishes a site or sends an enquiry.

Successful branch CI runs also attach `owner-review-<commit SHA>` for 14 days. Open the repository's **Actions**, select **Verify Seven Steps** for the intended commit and download its owner-review artifact. Extract the GitHub artifact wrapper, then use the inner `owner-review.zip`. Do not upload the wrapper containing `manifest.json`. Use the matching manifest to identify the source and file hashes. Download may require repository sign-in.

## Host it in the chosen account

The user selected the photographer's Netlify account on 15 October 2026. The browser check reached Netlify's login page; no authenticated account or deployment access was available. Keep this ownership choice and do not substitute a maintainer's personal account. No hosting account, paid tier or review URL has been created by this work.

The photographer can upload the prepared ZIP from their existing account and return the HTTPS URL for verification. If the maintainer should perform the upload, first arrange authorized deployment access and sign in with the maintainer's own account, then verify the photographer's team/site identity. Do not share passwords or paste access tokens into chat. Repository Write access does not grant hosting access.

1. Sign in to the chosen Netlify account. In its project/site creation flow, choose a **manual deploy** or static folder upload. Provider labels may change. Check the active account and team before uploading.
2. Upload the contents of `upload/`, or the inner `owner-review.zip` if that UI accepts ZIP files. `index.html` must sit at the publish root.
3. Keep this site separate from production. Do not connect this review to the Git repository's normal Netlify configuration: that configuration selects the gated public build and contains backend adapters. The static upload has no Functions, database, environment variables or live enquiry sender.
4. Accept no paid plan or add-on without the account owner's decision. Record the resulting site ID, deploy ID, HTTPS URL and source/artifact hashes in a restricted handoff record.
5. Verify the deployed homepage, both story links, checklist filters, direct deep links and a nonexistent path. Test phone navigation, the viewer, reduced motion and the disabled enquiry button. Confirm the `X-Robots-Tag` and CSP headers from `_headers` took effect. Check that source files, the manifest and `/api/enquiries` are unavailable.
6. Share the verified HTTPS URL through the user's chosen channel. The agent has not sent any message to the photographer. Keep the current ZIP and deploy ID so the same version can be reviewed or restored.

The review contains a draft notice and requests search engines not to index it. **Noindex is not access control.** Anyone who obtains an unprotected URL may open it. If confidentiality is required, use a verified provider access/password feature under the account owner's approved plan before sharing. Do not imply an unlisted URL is private. This package contains placeholders and no real photographs or enquiry delivery.

For an update, build and validate again, produce a fresh package, upload it to the same separate review site and record the new deploy ID. Compare feedback against that version. Restore the previous static deploy if an update breaks review. The eventual business launch follows [LAUNCH.md](LAUNCH.md), with different content, contact and approval requirements.

## Give the reviewer a useful task

Ask them to review the homepage, one story, the other story and the checklist on both a phone and a computer. They can assess the layout, colours, typography, navigation and motion now. Label the photographic composition as provisional until they see their actual images in it.

Use this message after the real URL is available:

> This is the first version for your review: [paste the review link]. Please try it on your phone and computer. The Add/Replace notes show where your photographs and business details will go. The enquiry form is a demonstration and does not send anything. Tell us what feels right for your work, what you would change, and any section you want to add or remove. You can send your real material later. The repository also includes instructions so you or your developer can maintain it.

Collect feedback as **page or content reference / requested change / reason / priority / device and browser if something failed**. Screenshots help with visual feedback. Consolidate one agreed change list before revising the design. A preference, a confirmed business fact and a malfunction require different actions.

Do not ask the photographer to supply all real content before this first review. Their ability to edit later is covered in [the maintainer guide](MAINTAINER-GUIDE.md), [design system](DESIGN-SYSTEM.md) and [AI handoff](AI-HANDOFF.md). The website itself has no CMS or upload dashboard.
