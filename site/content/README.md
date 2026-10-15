# Public content inputs

Public rendering now exists. Publication remains blocked while the 27-slot register, approved content and release evidence are incomplete. The private review still includes the replacement checklist. Synthetic rendering tests use geometric images and explicit test text; they establish export behavior, not portfolio quality or launch readiness.

## Build modes

- `npm run build`: review output at `dist/`, with missing-content notes and a non-sending form.
- `npm run build:fixture`: synthetic public layout at `dist-fixture/`. Fixed `https://example.invalid` canonical origin, test contact displayed as text, noindex and robots disallow. No publish configuration uses this directory.
- `npm run build:integration`: review output at `dist-integration/`. The loopback enquiry integration runner adds its synthetic client at serve time.
- `npm run build:public`: requires the actual inputs and release evidence below. This command currently fails. The build removes the previous `dist/` first so a refused public export cannot leave a review artifact for deployment.

The build command must run from `site/`. The Astro configuration repeats content validation so invoking Astro directly does not bypass the public gate. Public output excludes the checklist route through `getStaticPaths`, rather than hiding it. Content-note components do not render, and the public content collection excludes the review register. Source maps stay disabled.

## Inputs to prepare when the owner supplies content

1. Keep cleared web masters under the ignored `.local/media-masters/` directory. Keep private originals and permission correspondence elsewhere. Add reproducible source provisioning to the release workflow before any remote public build.
2. Create `content/media.json` with only the selected image records. The media preparation script accepts `id`, `source`, `alt`, optional `caption`, optional `credit`, optional `focalPoint`, `kind: "photograph"` and `publicationCleared: true`. These fields describe a reviewed selection; the flag does not establish permission by itself. Record permission evidence in the release review. The compiler rejects synthetic inputs in public mode and generates the metadata-stripped derivative manifest at `.generated/media-public.json`.
3. Create `content/public.json` using the typed fields in `src/lib/public-content.ts`. The existing synthetic data in `tests/fixtures/public-content.ts` demonstrates shape only. Do not copy its claims or test identity into real content. Set `version: 1` and `kind: "public"`.
4. Update the canonical `src/data/content.ts` slot statuses, safe supplied labels and retain/omit decisions after checking the actual material. Review approval does not happen through this JSON or the browser checklist.
5. Complete `content/release-approval.json` after the remaining release checks and explicit publishing authorization. This file contains safe evidence references, not secrets or client correspondence.

## Public schema

`site` contains an approved HTTPS `origin` without a path or trailing slash, `name`, `tagline`, `description`, `footerText` and `sharePhotoId`.

`home` contains `label`, `title`, `description`, `heroPhotoId`, optional `companionPhotoId` with `companionCaption`, `workTitle` and `workDescription`. Both opening images must belong to the same published assignment.

`about` contains `heading`, `biography`, optional `portraitPhotoId`, a `process` array of title/description records and a `services` array of title/description records.

`stories` contains the two reviewed IDs, `wedding-story` and `couple-session`. Each record contains `title`, `category`, `description`, optional `context`, `coverPhotoId` and ordered `photoIds`. A cover must also appear in its gallery. References must be unique inside each gallery. The two real stories cannot reuse the same assignment images. The renderer does not impose the private draft's frame count; it allows 2 to 60 checked photographs per story.

`contact` contains `heading`, `introduction`, a confirmed public `email`, `privacyText` and `replyNote`. This renderer uses a checked mailto contact path. It requires `enquiryForm: false` and `personalDataHandling: true` in the publication decisions. A live form requires its separate provider acceptance before replacing this path. The synthetic fixture keeps its test email inactive.

`optional` can contain `faq` question/answer records, `pricing` text and a `review` quote/attribution record. Supply a genuine permitted review and accurate commercial details or omit these features. Each field must agree with its canonical slot decision. Logo artwork, team and film features remain omitted in this renderer. Retaining one blocks the build until its implementation and acceptance checks exist. A text wordmark uses the confirmed name.

The exporter rebuilds each allowed field and each referenced photograph. Private fields on input records never enter the rendered data. Referenced photographs must exist in the derivative manifest. An actual public manifest cannot include unused media. Plain text has length bounds and rejects markup, controls and prohibited punctuation.

## Release approval

The approval record has `version: 1`, `authorization: "public-release-approved"`, `contentSha256` for the exact bytes of `content/public.json`, and `mediaSha256` for the exact bytes of `.generated/media-public.json`. Rebuilds fail if either digest changes without a renewed review record.

Also record non-empty `approvedBy`, ISO `approvedAt`, `ownerContentEvidence`, `mediaRightsEvidence`, `contactTestEvidence`, `responsiveReviewEvidence`, `accessibilityReviewEvidence`, `realMediaBudgetEvidence`, `securityReviewEvidence` and `rollbackEvidence`. These references point to completed checks; they do not run those checks or grant publishing permission. An operator must inspect the evidence before recording approval. Keep all tokens and private correspondence outside the repository.

The actual inputs and approval file do not exist yet. Fixture tests cannot satisfy these gates or alter canonical readiness.
