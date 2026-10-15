# Prepare your photos

Use the pinned sharp package to build the files visitors download. Image processing runs before serving the site; you do not need Docker or a live image-transformation service. CI exercises the same code with geometric test images. Review your own photos for colour, detail and crop quality.

## Add the selected photos

Keep permitted web masters in `site/.local/media-masters/`, outside Git and `public/`. In `site/content/media.json`, list relative source paths and public descriptions. Store permissions and client details elsewhere.

```json
[
  {
    "id": "assignment-opening",
    "source": "assignment/opening.jpg",
    "alt": "Describe what you see in this photo.",
    "caption": "Add the public caption if needed.",
    "credit": "Add the agreed public credit.",
    "focalPoint": { "x": 0.5, "y": 0.5 },
    "kind": "photograph",
    "publicationCleared": true
  }
]
```

Replace the example text. Set `publicationCleared: true` after checking permission; the flag alone does not prove you can publish a photo. Keep the evidence for your release review.

From `site/`, run:

```sh
node scripts/prepare-media-public.mjs
```

Check `.generated/public-assets/media/` for the image files and `.generated/media-public.json` for IDs, descriptions, focal points, dimensions, URLs and byte sizes. The manifest excludes original paths, EXIF, private notes and approvals. Failed preparation removes the manifest and generated media folder.

For local/CI tests, run `node scripts/prepare-media-fixtures.mjs`. It creates three labelled geometric masters in `.generated/fixture-masters/`, files in `.generated/fixture-public/media/` and `.generated/media-fixture.json`. Keep these separate from your public photos; public preparation rejects synthetic records.

## File limits and encoding

Supply local single-frame JPEG, PNG, WebP or AVIF files. The compiler rejects URLs, animated/corrupt/missing files, path traversal, escaping symlinks, overlapping input/output folders, duplicate IDs and existing files with mismatched bytes. It processes one derivative at a time.

| Setting | Value |
|---|---|
| Master and batch limits | 20 MiB per master; 256 MiB per batch; 80 records |
| Source dimensions | 48 million pixels; 12,000 pixels per edge |
| Responsive widths | 480, 960, 1440, 1920px; no upscaling; include useful native/capped width |
| Responsive height | At most 3840px |
| Full-frame JPEG | Fits within 2560 × 2560px |
| Encoding | AVIF quality 55; WebP 80; progressive JPEG 82 |
| Orientation and colour | Apply EXIF rotation; convert to sRGB; flatten transparency against Paper `#FAFAF8` |
| Metadata | Strip EXIF, IPTC, XMP and ICC |

Export a smaller checked web master if your source exceeds these limits. Keep camera archives separate. Output dimensions populate `srcset` and the manifest. Content hashes determine filenames, so changed bytes get new URLs.

## Check the page and full-frame viewer

Pass a public `Photograph` record to `PhotoSpace`. It emits AVIF/WebP sources, a JPEG fallback and intrinsic dimensions. Set `sizes` for the page's layout. Load one lead image eagerly with high priority; lazy-load the others. Use `object-position` for the chosen focal point in cover crops. Story photos can retain their natural ratio.

The full-frame link works without JavaScript. With JavaScript, the viewer requests that file when someone opens it. Check that page entry does not fetch unrequested full-size images.

Run `node --test tests/media.test.mjs` for transformations, orientation/profile/metadata, transparency, size, path, format, collision and clearance checks. In browser tests, inspect selected image sizes, loading/failure states, dimensions and full-frame viewing.

With your photos, inspect skin, fabric, jewellery, dark detail, gradients and grain at the displayed sizes and pixel densities. Review phone crops and full frames. Measure critical-path, ten-second entry and full-story transfers; adjust your edit, sizes or encoding as needed.

Before release approval, your developer must implement and test the [local real-content preview in launch step 3.5](../../docs/LAUNCH.md#3-prepare-the-real-candidate-after-the-placeholder-review). Existing test images cannot establish those results. Keep the public-build checks intact while preparing that preview.
