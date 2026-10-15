# Build the review ZIP

Use this export for the current placeholder site. It includes the checklist and a form that cannot send enquiries.

From `site/`:

```sh
npm run check
npm run build
npm run test:review-package
npm run package:review
npm run preview:review-package
```

Open `http://127.0.0.1:4325/` to check the current `dist/` build with the upload headers. This server does not read the saved ZIP. Restart it after rebuilding. To view the saved ZIP, follow [the download instructions](../review/README.md).

## Output files

| Path under `site/.review-package/` | Use |
|---|---|
| `owner-review.zip` | Download or upload the website. It has `index.html` at the archive root. |
| `upload/` | The same website as an unpacked folder. |
| `manifest.json` | Check file hashes and the checkout recorded at packaging time. Keep it out of the hosted folder. |

Copy the ZIP and manifest together into the tracked `review/` folder to update the version shared through GitHub. CI also attaches an export after a successful run, but that download expires after 14 days.

The ZIP command uses `/usr/bin/zip` on Mac or Linux. If it is unavailable, run `node scripts/package-review.mjs` for the folder export.

## Checks and limits

The packager checks the existing `dist/`. It accepts the five review pages, two local fonts and required assets. It rejects real or embedded media, active enquiry forms, external assets, inline scripts, source maps, symlinks, unexpected files and recognised credential patterns. CSS imports and escaped tokens require a packaging change and review.

A failed check removes the previous generated package. Fixed file timestamps and permissions make the ZIP repeatable with the same inputs and ZIP implementation.

The included Netlify `_headers` blocks indexing, framing, form submission and network connections. It permits the local assets and inline CSS used by this version. Verify those headers after hosting; noindex alone does not restrict access.

Use `dist/` from `npm run build`. The fixture and integration builds contain test content and are not review exports. Use [the launch guide](LAUNCH.md) for a future release with your photos and working enquiry destination.
