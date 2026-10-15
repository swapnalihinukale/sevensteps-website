# Owner review package

This package contains the ordinary placeholder website for an owner review. It includes the content checklist and Add/Replace guidance. The forms stay non-sending. Packaging does not publish the site or activate an account.

From `site/`, after a successful ordinary review build and its checks:

```sh
node scripts/package-review.mjs --zip
```

Use `node scripts/package-review.mjs` when you need the folder only. The optional ZIP uses `/usr/bin/zip` when present on Mac or Linux. It adds no npm dependency. If that executable is unavailable, the folder command remains usable.

The script creates these separate outputs under ignored `site/.review-package/`:

- `upload/` contains the static pages, compiled CSS/JavaScript, the two local fonts and their licences, favicon, crawler rules and generated Netlify `_headers`.
- `owner-review.zip`, when requested, contains the contents of `upload/` at the archive root. Use this archive for a manual static upload after the applicable sharing authorization.
- `manifest.json` stays outside the upload folder and ZIP. It records the UTC timestamp, source commit, clean/modified working-tree state, artifact hashes and per-file hashes. The source stamp describes the checkout at packaging time; the artifact hashes identify the exported bytes. Keep it as local delivery evidence.

The script snapshots and checks the existing `dist` files. It does not build, alter `dist`, copy the repository, or include server functions, runtime data, credentials, originals or real photographs. A rejected validation removes the previous generated package so an older export cannot appear current. Package file timestamps and modes are fixed; the source timestamp stays in the external manifest. Identical files produce the same ZIP with the same system ZIP implementation.

## Export checks

The export accepts only the five reviewed HTML routes and the required static assets. It checks the noindex notice on each page, the 27-group checklist, placeholder guidance, non-sending forms, disabled submission controls and local destinations. It rejects fixture/integration/public content, real or embedded media, source maps, unknown files/directories, symbolic links, named form fields, endpoints, inline scripts, external assets and recognised credential/private-source patterns. CSS supports the current plain generated form; escaped CSS tokens and imports require an explicit export review. These checks supplement the normal type, content, browser and repository checks.

The generated `_headers` disallows indexing, framing, form submission, external connections and media loading. It permits the existing local script, stylesheet, fonts and inline CSS needed by the current layout and motion controls. Netlify reads this file for static uploads. Another host must apply equivalent response headers through its own configuration.

`noindex` does not provide access control. Use a private review destination with access restrictions when the sharing workflow supplies one. This export contains placeholders and public draft labels; it does not grant permission to upload cleared or uncleared client photographs later. Real-media and public-release exports use their separate approval process.

Run `node --test tests/review-package.test.mjs` for export, headers, source/output separation, unsafe input, stale-package removal and ZIP-content checks. Repackage after changing the reviewed build. Do not substitute `dist-fixture` or `dist-integration` for the ordinary `dist` input.
