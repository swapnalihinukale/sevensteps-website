# Current owner review

This folder keeps the checked placeholder website on the same branch as its source and documentation. The user requested a repository-only handoff. No separate file transfer or hosting login is needed to receive this work.

Share [the branch](https://github.com/swapnalihinukale/sevensteps-website/tree/feat/sevensteps-rebuild). Start with [the main README](../README.md) for the site, architecture and editing guides.

## Files

- [owner-review.zip](owner-review.zip): the 15 checked static website files, including the content checklist, local fonts and security headers. On GitHub, open the file and use **Download raw file**. It is about 117 KiB.
- [manifest.json](manifest.json): file hashes and the source checkout recorded when the package was prepared. Keep this file outside a hosted site's publish folder.

The archive is a saved review snapshot. The manifest's `sourceCommit` identifies the checkout at packaging time, not the later commit that adds the archive to Git. Its hashes identify the bytes in this ZIP. The code and documentation may advance after this snapshot; regenerate it before sharing a changed website.

The website contains labelled placeholders and a non-sending enquiry form. A GitHub branch/file link shows repository contents; it is not a live website URL. For local viewing, follow [the setup guide](../site/README.md). If the owner later chooses to host the review, follow [preview sharing](../docs/PREVIEW-SHARING.md). Extract only the ZIP into a publish folder with `index.html` at its root. Do not upload this whole repository or this folder's README/manifest as the website.

## Update the saved snapshot

From `site/`, rebuild and check the ordinary review, then run `npm run package:review`. Copy `.review-package/owner-review.zip` and `.review-package/manifest.json` together into the repository's `review/` folder. Verify the archive hash and each file against the manifest. Inspect the source diff and commit both snapshot files on `feat/sevensteps-rebuild` with the related website change.

Keep generated working directories ignored. This one bounded static export is tracked for the requested handoff. Never include originals, credentials, live enquiry data or test integration artifacts in the archive. The packaging guard rejects those inputs. Unlike a temporary CI artifact, this committed snapshot remains in Git history and does not expire after 14 days.
