# Seven Steps design system

Use your photographs as the main content. The design, **Close to the people**, pairs a lead frame with a related moment, then offers two complete stories. Keep both story choices visible. On phones, show the service description and work link before the lead photo and its companion.

Edit the values below in `site/src/styles/global.css`. The coloured photo spaces are placeholders; replace them with your work without applying their tint to your photographs. Keep the Add/Replace notes until you have checked the relevant content.

## Colours

Change the named `:root` tokens first, then check the related hover, focus and error colours.

| Token | Value | Use |
|---|---|---|
| `--paper` | `#FAFAF8` | Page and control backgrounds. |
| `--ink` | `#242422` | Text, headings and strong controls. |
| `--leaf` | `#405B4B` | Primary actions and selected controls. |
| `--rose` | `#722F46` | Pomegranate accent: wordmark dot, focus ring and replacement notes. |
| `--mist` | `#E5E7E3` | Supporting sections and the moving gallery area. |
| `--quiet` | `#60615B` | Secondary text. |
| `--line` | `#D6D9D1` | Dividers and borders. |

Related values: work-section background `#F0F1EC`, text selection `#D9DDD0`, primary-button hover `#304738`, control hover `#EDF0E7`.

Placeholder colours:

| Tone | Background | Text |
|---|---|---|
| Leaf | `#C7D0C2` | `#334D3A` |
| Rose | `#DEC9C9` | `#6C3346` |
| Sand | `#E2DCD0` | `#605643` |
| Mist | `#E1E5E0` | `#485E4E` |
| Ink | `#485B50` | `#F3F4ED` |

On Paper, the recorded contrast ratios are Ink 14.88:1, Leaf 7.14:1 and Pomegranate 9.09:1. Recheck contrast after changing any pair, including text, disabled/error states and focus. Test forced-colour mode too. These ratios do not cover text placed over a photograph.

## Fonts and type sizes

Use Source Serif 4 for headings and Source Sans 3 for reading and controls. Their CSS names are `Source Serif` and `Source Sans`, with Georgia/serif and Segoe UI/sans-serif fallbacks. Fontsource 5.3.1 supplies two local normal Latin variable WOFF2 files, weights 200 to 900, with `font-display: swap`. Most text uses weight 400.

| Element | Size and spacing |
|---|---|
| Body | Source Sans, `18px/1.5`; 17px at 720px and below. |
| Main heading | Source Serif, `clamp(52px, 6.6vw, 106px)`, line-height 1.02. |
| Section heading | Source Serif, `clamp(38px, 4.2vw, 66px)`, line-height 1.02. |
| Third-level heading | 25px, line-height 1.15, with some component overrides. |
| h1/h2 tracking | `-.045em`, weight 400. |
| Homepage h1, up to 1000px | `clamp(50px, 7vw, 75px)`. |
| Homepage h1, up to 720px | `clamp(46px, 12.8vw, 84px)`, maximum 11ch. |
| Story h1 | `clamp(48px, 6vw, 92px)`; `clamp(46px, 11vw, 72px)` up to 720px. |
| Paragraph width | Maximum 65ch; hero description 31ch on desktop and 35ch on phones. |
| Navigation and controls | Usually 15 to 16px. Keep their touch-target dimensions. |
| Captions, notes and metadata | Usually 12 to 15px. Check readability at zoom. |

The two font files total 77.94 KiB in the recorded build. To add Marathi or another script, check glyph coverage and add a suitable subset or fallback with its licence. Measure the added bytes. Avoid importing a full family or remote stylesheet for one label.

Keep `overflow-wrap: anywhere` on headings, paragraphs and figures, plus the wordmark/footer wrapping rules. Test a long business name and story title at 320px after changing type sizes.

## Layout and spacing

The CSS uses grid and flex with component-specific spacing. Reuse the spacing of a related section when adding content.

`.wrap` uses border-box sizing, automatic inline margins, `max-width: 1440px` and `padding-inline: clamp(22px, 4.5vw, 88px)`. At 1600px and above, its maximum width is 1680px. Those maximums include the gutters, so do not add another full gutter inside a wrapped child.

| Area | Desktop | Narrow screens |
|---|---|---|
| Hero | Columns `1.02fr 1fr`; 6% gap, 5% up to 1000px, 9% from 1600px. Padding 44px above and 90px below. | At 720px and below: one column, padding 20px/65px. Order: copy, lead frame, companion. |
| Lead photo | Ratio 4/5.1; maximum height 780px from 1600px. | Ratio 5/5.6 at 720px and below. |
| Work cards | Columns `1.17fr 1fr`, 7% gap; second card starts 104px lower. Section padding 74px/100px. | At 720px and below: one column, 38px gap. First card has 4% right inset; second has 8% left inset. Padding 55px/60px. |
| Approach | Heading columns 1:1; body columns `.8fr 1.25fr`, 10% gap, 7% up to 1000px. | Stacked sections at 720px and below. Portrait takes a 40% column beside its note. |
| Story cover | Ratio 16/8 inside the wrap. | Ratio 4/5 at 720px and below. |
| Story grid | Two equal columns, 28px column gap and 45px row gap. Every third frame spans both columns with 12% inline inset. | Up to 720px: 14px/28px gaps and no inset on the spanning frame. Up to 380px: one column. |
| Small controls | Usually at least 44px high/wide, with 2px corner radius. | Wrap controls to keep targets reachable. The short landscape viewer has its own compact layout. |

After changing columns, gutters, insets or breakpoints, update `site/src/lib/image-sizes.ts` too. It sets the `sizes` attributes used to select image downloads. Every third story frame needs a wider image than a normal frame.

Run `tests/browser/image-sizes.spec.ts` after layout changes. It compares declared widths with the rendered images, allowing 2px, at these widths in Chromium, Firefox and WebKit:

`320, 380, 381, 720, 721, 1000, 1001, 1440, 1599, 1600, 1920, 2560`

Keep the widths on both sides of each breakpoint.

## Display your photos

Pass a `Photograph` record to `PhotoSpace.astro` to replace an empty photo space. The record contains descriptions, intrinsic dimensions, focal point and generated image variants. Use `priority` for the single opening image so it loads eagerly with high priority. Let the remaining images lazy load. Get `sizes` from the layout helper and choose `fit="cover"` or `fit="contain"` for the placement.

The image preparation script generates AVIF, WebP and progressive JPEG, applies source orientation, converts to sRGB, flattens transparency against Paper and strips private metadata. A focal point uses 0 to 1 on each axis and sets `object-position`; it does not modify the original image. Check both the crop and full frame after changing it.

Story-image links open a full-image derivative without JavaScript. With JavaScript, the viewer loads the selected full frame when requested and fits it inside the dialog. Keep the image-error message and recovery controls. Do not preload every full-frame file.

Use your photos to judge skin tones, fabric, jewellery, shadows and grain before changing compression quality or accepting a crop. The geometric test images check processing and loading behavior. [Image preparation](../site/docs/MEDIA-PIPELINE.md) lists encoding settings and input limits.

## Motion and controls

Keep movement attached to a visitor's action and use native page scrolling. Visitors do not need to wait for an opening animation or play the strip to see your work.

| Interaction | Setting |
|---|---|
| Link arrows | 160ms transform transition, `cubic-bezier(.2,.7,.25,1)`, 3px horizontal movement on supported hover actions. |
| Work images | 200ms brightness response. Check its effect on your photos. |
| Menu | Opaque panel moves 5px over 180ms. Text stays opaque. |
| Viewer | 8px entry over 180ms; controls stay still. |
| Reading progress | 2px line with a scroll timeline where supported. |
| Moving gallery | One finite pass after Play: Across at 16px/second, Down at 10px/second. Slow halves the rate. |

The gallery provides Play/Pause, Stop & reset, Across/Down, Forward/Backward and Normal/Slow. It pauses when the visitor inspects a photo, focuses another control, opens the viewer or leaves the strip's visible area. Layout changes, a hidden page, an image error or a reduced-motion change also pause it. It stops at the end; the visitor chooses when to resume.

In `ui.ts`, keep `will-change: transform` limited to the active pass and remove it when stopped. The normal image grid stays still and available beside this optional interaction.

The system reduced-motion setting overrides the site's Full/Still choice. Still disables transitions, smooth scrolling and reading progress. The optional saved choice expires after 30 days; if storage is blocked, retain it in memory for that visit.

## Keyboard, touch and error states

Keep the existing headings, navigation landmarks, labels, disclosures, links and skip link to main content. Focus uses a 3px Pomegranate outline with a 5px offset. Test focus and borders in forced-colour mode.

The viewer uses a native dialog. Keep Escape, arrow navigation, focus inside the open dialog and focus restoration to the opener. At either end, move focus to an enabled control if Next or Previous becomes disabled. Keep mobile navigation usable after resizing across a breakpoint, and leave normal links visible without JavaScript. Do not put essential information behind hover alone.

Preserve these small-screen rules:

- Viewer: dynamic viewport height with a fallback and safe-area padding.
- Short landscape: compact layout at height 500px or less and width 600px or more.
- Form: container-query stacking below 420px, backed by the viewport layout.

For enquiry messages, match the wording to the state: preview, validation error, pending, uncertain receipt, stored receipt or recovery. The preview cannot send; the local test form uses fake notifications. A stored receipt confirms database storage, not a booking.

## Check a design change

1. Change the named token or component, then run `npm run check` from `site/`.
2. Build the review and image fixture. Inspect your change at narrow portrait, short landscape, tablet, desktop and 2560px, including the breakpoint neighbours above. Try long names, blocked fonts/images and 200% zoom.
3. Run the affected browser tests, including image geometry for layout changes. Check menu reflow, viewer ends, error recovery, reduced motion and no-JavaScript navigation. Inspect screenshots alongside assertions.
4. Run byte budgets after changing fonts, scripts or images. Measure real-photo entry and a full story separately from the HTML/CSS/script/font budget.

For the full test setup, use [Maintain your website](MAINTAINER-GUIDE.md). The [responsive](RESPONSIVE-AND-RELIABILITY-SPEC.md) and [motion](MOTION-AND-INTERACTION-SPEC.md) specifications list the remaining checks.

Write text in your own voice using the [copy guide](COPY-AND-VOICE-SPEC.md) and local [stop-slop skill](../.agents/skills/stop-slop/SKILL.md). Use accurate descriptions, names and promises, with no em dashes in authored text. Keep upstream quotations and licences intact. Before proposing a larger visual change, read [DESIGN.md](../DESIGN.md), the [photographer adapter](../.agents/skills/photographer-design-codex/SKILL.md) and [frontend-design](../.agents/skills/frontend-design/SKILL.md).
