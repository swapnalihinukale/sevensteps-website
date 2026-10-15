# Add your public content

After you review the placeholder site, prepare your photos and copy with these files. The 27 content groups still need your material and review. Run commands below from `site/`; use [the maintainer guide](../../docs/MAINTAINER-GUIDE.md) for local setup.

## Build modes

| Command | Output and use |
|---|---|
| `npm run build` | `dist/`: review notes and a non-sending form |
| `npm run build:fixture` | `dist-fixture/`: geometric test images, `https://example.invalid`, inactive email, noindex and robots disallow. Do not deploy. |
| `npm run build:integration` | `dist-integration/`: local enquiry test. The loopback server adds the test client when serving it. Do not deploy. |
| `npm run build:public` | `dist/`: requires your completed content and release evidence. It currently refuses the missing inputs and removes previous output before building. |

Astro repeats content validation even if you invoke it without the wrapper. Public builds exclude the checklist route through `getStaticPaths`, content notes and the review register. Source maps stay disabled.

## Prepare your files

1. Keep permitted web masters in ignored `.local/media-masters/`. Store camera originals and permission correspondence elsewhere. Your developer still needs to implement and verify how a remote build retrieves those masters.
2. Create `content/media.json` with the selected photos: `id`, `source`, `alt`, optional `caption`, optional `credit`, optional `focalPoint`, `kind: "photograph"` and `publicationCleared: true`. Set clearance after checking permission. Run the [image preparation](../docs/MEDIA-PIPELINE.md) command to generate `.generated/media-public.json`. Public preparation rejects synthetic images and strips private metadata.
3. Create `content/public.json` with `version: 1`, `kind: "public"` and the fields below. Use `tests/fixtures/public-content.ts` to understand the shape; replace its test identity and text with your approved facts.
4. Update `src/data/content.ts` with checked slot statuses, safe supplied labels and retain/omit decisions. Changing a status or clicking the browser checklist does not approve publication.
5. **Preview and test your finished pages before recording approval.** Your developer must first implement the isolated real-content preview described in [launch step 3.5](../../docs/LAUNCH.md#3-prepare-the-real-candidate-after-the-placeholder-review). We have not built it yet. Current review/fixture modes cannot provide those final pages, and public mode requires completed release evidence. Do not invent approval records or bypass that check to preview your work.
6. Complete `content/release-approval.json` after those tests and your explicit approval to publish. Keep evidence references in this file and private correspondence elsewhere.

## Public schema

Use `src/lib/public-content.ts` for the checked types and limits.

| Record | Fields and rules |
|---|---|
| `site` | Set your HTTPS `origin` without a path or trailing slash, plus `name`, `tagline`, `description`, `footerText`, `sharePhotoId`. |
| `home` | Add `label`, `title`, `description`, `heroPhotoId`, `workTitle`, `workDescription`. Optional `companionPhotoId` requires `companionCaption`; choose both opening photos from the same assignment. |
| `about` | Add `heading`, `biography`, optional `portraitPhotoId`, and `process`/`services` arrays of `title`/`description` records. |
| `stories` | Use both IDs: `wedding-story` and `couple-session`. Each needs `title`, `category`, `description`, optional `context`, `coverPhotoId` and ordered `photoIds`. Include the cover in its gallery. Choose 2 to 60 photos per story, without duplicates within or between assignments. |
| `contact` | Add `heading`, `introduction`, confirmed `email`, `privacyText`, `replyNote`. The email-link version requires `enquiryForm: false` and `personalDataHandling: true` in publication decisions. Test live-provider setup before replacing it with an active form. The fixture's test email stays inactive. |
| `optional` | Add `faq` question/answer records, `pricing` text or a `review` quote/attribution record where you have accurate, permitted content. Match each retain/omit decision. |

Keep logo artwork, team and film omitted until their implementation and checks exist. Retaining them stops the build. Use your confirmed name in the text wordmark.

Reference photos from the generated manifest and remove unused media from the public selection. The exporter copies allowed fields and referenced photos, leaving private input fields behind. Plain text must satisfy the length limits and contain no markup, controls or prohibited punctuation.

## Release approval

No actual content or approval file exists yet. Complete the real-content preview and checks above before filling this record.

Set `version: 1`, `authorization: "public-release-approved"`, `contentSha256` for the exact bytes of `content/public.json`, and `mediaSha256` for `.generated/media-public.json`. Review again if either hash changes.

Supply non-empty `approvedBy`, ISO `approvedAt`, `ownerContentEvidence`, `mediaRightsEvidence`, `contactTestEvidence`, `responsiveReviewEvidence`, `accessibilityReviewEvidence`, `realMediaBudgetEvidence`, `securityReviewEvidence` and `rollbackEvidence`. Inspect the completed checks before referencing them. Keep tokens and private correspondence outside Git. Test fixtures do not supply release evidence or change your content's readiness.
