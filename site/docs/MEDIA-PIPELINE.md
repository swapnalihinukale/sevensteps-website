# Image preparation

The site builds static image derivatives with the pinned `sharp` package. It does not need a container image or a running image-transformation service. CI repeats the transformations using generated geometric fixtures. These fixtures verify behaviour; they cannot establish the quality of the photographer's future images.

## Inputs and output

Keep permitted web masters under `site/.local/media-masters/`, outside Git and `public/`. Put only the source list and public descriptions in `site/content/media.json`. Keep permission correspondence and client details outside that file. Source names use relative paths beneath the fixed master directory.

```json
[
  {
    "id": "assignment-opening",
    "source": "assignment/opening.jpg",
    "alt": "A short description of the actual photograph.",
    "caption": "Optional approved caption.",
    "credit": "The approved public credit.",
    "focalPoint": { "x": 0.5, "y": 0.5 },
    "kind": "photograph",
    "publicationCleared": true
  }
]
```

`publicationCleared` records a completed rights check. Do not set it to make a build pass. The public release gate also requires the owner's evidence and the exact prepared content/media hashes. The source list does not prove permission by itself.

Run `node scripts/prepare-media-public.mjs` from `site/`. It reads those fixed paths and writes derivatives under `.generated/public-assets/media/` plus the public manifest `.generated/media-public.json`. The manifest contains image IDs, approved descriptions, focal points, dimensions and derivative URLs/byte sizes. It does not contain original paths, EXIF, private notes or approval records. A failed preparation removes its manifest and generated media directory.

For local and CI fixtures, run `node scripts/prepare-media-fixtures.mjs`. It generates three geometric raster masters under `.generated/fixture-masters/`, then writes `.generated/fixture-public/media/` and `.generated/media-fixture.json`. Each record says it is synthetic. Public preparation rejects synthetic records. Build mode chooses a separate directory so a real public export cannot copy fixture assets by accident.

## Bounds and encoding

The compiler accepts local single-frame JPEG, PNG, WebP and AVIF raster inputs. It rejects URLs, path traversal, escaping symlinks, animated formats, missing/corrupt files, overlapping input/output directories, duplicate IDs and existing output files whose bytes do not match. It processes one derivative at a time to limit peak work.

The limits are 20 MiB per master, 256 MiB per batch, 80 records, 48 million source pixels and 12,000 pixels per source edge. Larger material needs a reviewed web-master export before it enters this pipeline. Camera archives remain separate.

Responsive candidates target widths 480, 960, 1440 and 1920 pixels. The compiler drops candidates that would upscale, includes the useful native/capped width, and caps responsive height at 3840 pixels. The full-frame JPEG fits within 2560 by 2560 pixels. Actual output dimensions populate `srcset` and the manifest.

The compiler applies EXIF rotation, converts pixels to sRGB, flattens transparency against Paper `#FAFAF8` and strips EXIF, IPTC, XMP and ICC metadata. AVIF quality 55, WebP quality 80 and progressive JPEG quality 82 are initial settings. The locked encoder and the content hash give each output a stable filename. Changing encoded content changes its URL.

`PhotoSpace` accepts an optional public `Photograph` record. It emits AVIF/WebP `<source>` candidates with a JPEG fallback and intrinsic dimensions. Pages supply `sizes` to match their layout. One lead image uses eager loading and high priority; other photographs use lazy loading. CSS `object-position` applies the focal point to cover crops. Story images can keep their natural aspect ratio, and a normal full-frame image link remains available without JavaScript. The viewer requests that full derivative after intent.

## Checks before using the photographer's work

Run `node --test tests/media.test.mjs` for real transformation, orientation/profile/metadata, transparency, size, path, format, collision and clearance tests. Browser checks must confirm selected image candidates, load/error states, dimensions, full-frame viewing and the absence of unrequested full-image downloads.

When original work arrives, inspect skin tones, cloth, jewellery, dark detail, gradients and grain at the displayed sizes and pixel densities. Review phone crops and the full frame with the photographer. Measure the actual critical-path, ten-second entry and full-story transfer budgets. Change the edit, dimensions or encoding after that comparison. The synthetic fixture's small byte sizes do not satisfy real-media fidelity or performance gates.
