# Review the site

Download [owner-review.zip](owner-review.zip). On GitHub, open the file and choose **Download raw file**. The ZIP is about 117 KiB and includes the homepage, both stories, fonts and content checklist.

Extract the ZIP. If you have Python 3 installed, open a terminal in the extracted folder and run:

```sh
python3 -m http.server 4325 --bind 127.0.0.1
```

Open [the local review](http://127.0.0.1:4325/). Press Ctrl+C in the terminal when finished. Opening HTML files by double-clicking will not load the site correctly.

This simple server lets you review the pages. It does not apply Netlify's security headers. To build from source and check those headers, follow [the review package guide](../docs/REVIEW-PACKAGE.md).

Review the layout, colours, navigation and motion. Use the Add/Replace notes to see where your photos and text belong. The form does not send enquiries.

## Update this copy

From `site/`, rebuild and check the review, then run `npm run package:review`. Copy `.review-package/owner-review.zip` and `.review-package/manifest.json` into this folder together. Check the hashes and commit both files on `feat/sevensteps-rebuild`.

[manifest.json](manifest.json) records the packaged files and their hashes. Its source commit is the checkout used for packaging, before the later commit that saves the ZIP. Regenerate the ZIP after a website change.

For hosting later, follow [preview sharing](../docs/PREVIEW-SHARING.md). Upload the ZIP's contents with `index.html` at the root. Keep this README and the manifest out of the published folder.
