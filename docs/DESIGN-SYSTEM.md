# Design system

This document describes the implemented design at `8ef0d59`. [DESIGN.md](../DESIGN.md) records the selected direction, **Close to the people**. The owner is still reviewing the placeholder version. The palette and composition are working design decisions, not owner-supplied brand guidelines or cleared photographic work.

Use this guide with [the responsive specification](RESPONSIVE-AND-RELIABILITY-SPEC.md), [motion specification](MOTION-AND-INTERACTION-SPEC.md) and [copy specification](COPY-AND-VOICE-SPEC.md). Read the local [photographer adapter](../.agents/skills/photographer-design-codex/SKILL.md), [frontend-design](../.agents/skills/frontend-design/SKILL.md) and [stop-slop](../.agents/skills/stop-slop/SKILL.md) before changing their surfaces.

## Composition and visitor purpose

The homepage pairs one lead photograph with a smaller moment from the same assignment. Unequal areas give the opening a recognisable composition without covering a photograph in sales text. Two visible work choices lead to complete stories. The introduction, process and contact area help a prospective client judge who will photograph them and what to do next.

On a phone, read the service context and work link before the lead image, then the companion. Preserve that reading order and both story choices. Do not require a rotating carousel or a motion effect to discover essential work. The story page moves from context to an ordered photographic edit, with a contained full-frame viewer and an optional moving strip.

The review shows what the owner needs to supply. Keep missing photos and facts labelled until their review is complete. Muted image mats communicate gaps; they are not portfolio artwork or a colour grade to apply to photographs. Public rendering uses checked real-image records and excludes the owner notes.

## Colour

The source is `site/src/styles/global.css`, primarily its `:root` block. Names in CSS are the implementation keys.

| CSS token | Colour | Role |
|---|---|---|
| `--paper` | `#FAFAF8` | Main page and control surfaces. |
| `--ink` | `#242422` | Body text, headings and strong controls. |
| `--leaf` | `#405B4B` | Primary action, selected control accent and restrained structure. |
| `--rose` | `#722F46` | Pomegranate accent, wordmark dot, focus ring and owner guidance. |
| `--mist` | `#E5E7E3` | Supporting sections, motion area and information surfaces. |
| `--quiet` | `#60615B` | Secondary readable text. |
| `--line` | `#D6D9D1` | Dividers and boundaries. |

The work section uses `#F0F1EC`. Selection uses `#D9DDD0`. The primary action hover is `#304738`; a control hover uses `#EDF0E7`. These values support the base palette and should change with a reason, not as isolated replacements.

Placeholder tones are separate from the five main colours:

| Tone | Background | Text |
|---|---|---|
| Leaf | `#C7D0C2` | `#334D3A` |
| Rose | `#DEC9C9` | `#6C3346` |
| Sand | `#E2DCD0` | `#605643` |
| Mist | `#E1E5E0` | `#485E4E` |
| Ink | `#485B50` | `#F3F4ED` |

Recorded contrast on Paper is 14.88:1 for Ink, 7.14:1 for Leaf and 9.09:1 for Pomegranate. Those pairs are useful checks, not certification of future overlays or all interaction states. Test text, borders, focus and disabled/error states after a palette change. Preserve visible focus in forced-colour mode.

## Typography

Two local normal Latin variable WOFF2 files load through Fontsource 5.3.1. `Source Serif 4` supplies the CSS family `Source Serif`; `Source Sans 3` supplies `Source Sans`. The fallback stacks are Georgia/serif and Segoe UI/sans-serif. The implemented weight range is 200 to 900 with `font-display: swap`, and the main layout uses weight 400.

| Element | Current size and rhythm |
|---|---|
| Body | Source Sans, `18px/1.5`; 17px at 720px and below. |
| Main heading | Source Serif, `clamp(52px, 6.6vw, 106px)`, line-height 1.02. |
| Section heading | Source Serif, `clamp(38px, 4.2vw, 66px)`, line-height 1.02. |
| Third-level heading | 25px, line-height 1.15. Individual component rules may change it. |
| Headline tracking | `-.045em` on h1/h2; weight 400. |
| Homepage heading, up to 1000px | `clamp(50px, 7vw, 75px)`. |
| Homepage heading, up to 720px | `clamp(46px, 12.8vw, 84px)`, maximum 11ch. |
| Story heading | `clamp(48px, 6vw, 92px)`; `clamp(46px, 11vw, 72px)` on phones. |
| Body line length | Paragraphs cap at 65ch; hero description at 31ch on desktop and 35ch on phones. |
| Navigation and controls | Usually 15 to 16px, with explicit touch target dimensions. |
| Captions, notes and metadata | Usually 12 to 15px; maintain contrast and readable zoom behavior. |

The fonts total 77.94 KiB in the current artifact. Do not import the full font family or remote font stylesheets to change a single label. Check glyph coverage before Marathi, another script, a currency sign or a new weight/style. Add a suitable checked subset or fallback and its licence, then measure the added bytes.

Headings, paragraphs and figures use `overflow-wrap: anywhere` so long supplied names do not force horizontal page scrolling. The wordmark and footer also need their existing shrink/wrap rules. Test a long business name and a long story title at 320px after typography changes.

## Layout, spacing and responsive images

The layout uses native grid and flex. There is no spacing-token framework behind it. Reuse an existing section's spacing rule when adding related content and keep changes scoped to that component.

The border-box `.wrap` has `max-width: 1440px`, automatic inline margins and `padding-inline: clamp(22px, 4.5vw, 88px)`. At 1600px and above, its maximum becomes 1680px. The maximum includes the gutters. Do not add a second full gutter inside a wrapped child.

| Surface | Desktop rule | Narrow rule |
|---|---|---|
| Hero | Columns `1.02fr 1fr`; 6% gap, 5% up to 1000px and 9% from 1600px. Padding 44px above and 90px below. | One column up to 720px, 20px above and 65px below. Lead frame follows copy; companion follows the lead. |
| Lead image | Ratio 4/5.1; maximum height 780px from 1600px. | Ratio 5/5.6 on phones. |
| Work | Columns `1.17fr 1fr`, 7% gap; second card begins 104px lower. Section padding 74px/100px. | One column, 38px gap; first card keeps 4% right inset, second 8% left inset. Section padding 55px/60px. |
| Approach | Heading columns 1:1; body columns `.8fr 1.25fr` with 10% gap, 7% up to 1000px. | Stacked sections up to 720px. Portrait uses a 40% column beside its review note. |
| Story cover | Ratio 16/8 within the wrap. | Ratio 4/5 up to 720px. |
| Story grid | Two equal columns, 28px horizontal gap and 45px row gap. Every third frame spans both columns with 12% inline inset. | Up to 720px: 14px/28px gaps, no inset on a spanning frame. Up to 380px: one column. |
| Small controls | Usually 44px minimum height/width; 2px corner radius. | Controls wrap to retain reachable targets. The short-landscape viewer has a separate compact layout. |

`site/src/lib/image-sizes.ts` mirrors these rules for `sizes` attributes. Update it with the CSS when changing gutters, columns, insets or breakpoints. In particular, every third story image is wider than an ordinary frame. Incorrect declarations can waste transfer bytes or request a blurry candidate.

The browser test `tests/browser/image-sizes.spec.ts` compares declared image widths with rendered geometry at 320, 380, 381, 720, 721, 1000, 1001, 1440, 1599, 1600, 1920 and 2560 pixels. It currently passes within 2px in Chromium, Firefox and WebKit. Keep the breakpoint-neighbour cases when editing this helper.

## Image treatment

`PhotoSpace.astro` accepts either a labelled empty space or a `Photograph` record. A real record contains public text, intrinsic dimensions, a focal point and generated source candidates. `priority` selects the one eager, high-priority lead image. Remaining images lazy load. `sizes` comes from the layout helper; `fit` chooses cover or contain.

The image pipeline creates AVIF, WebP and progressive JPEG. It rotates from source orientation, converts pixels to sRGB, flattens transparency against Paper and strips private metadata. Focal points are numbers from 0 to 1 on each axis. They set CSS `object-position`; they do not alter the stored original. Inspect both cover crops and the full frame after an edit.

Ordinary story links open a real full-image derivative without JavaScript. With JavaScript, the dialog loads the selected full frame on intent and uses contain fitting. Keep a useful failure state if an image cannot load. Do not show a broken-image icon as the only explanation or preload every full-frame file.

The current geometric fixtures exercise formats, orientation, dimensions and request behavior. Assess skin tones, fabric, jewellery, shadows and grain using the photographer's originals before changing encoder quality or approving a crop. [Image preparation](../site/docs/MEDIA-PIPELINE.md) holds the encoding values and input limits.

## Motion and interaction

The user asked for movement and arrows, balanced with speed and control. The implementation concentrates motion around actions. It does not move the page for the visitor or hide navigation behind an opening animation.

| Behavior | Implementation |
|---|---|
| Link arrows | 160ms transform transition with `cubic-bezier(.2,.7,.25,1)`; a 3px horizontal response on supported hover actions. |
| Work images | 200ms brightness response. Review photographic appearance before changing it. |
| Menu | An opaque panel enters by 5px over 180ms. Text stays opaque. |
| Viewer | An 8px entry over 180ms, with stationary controls and a full-frame image. |
| Reading progress | A 2px line using a scroll timeline only where supported. Absence of the feature leaves the story usable. |
| Moving gallery | A finite transform pass after Play. Across uses 16px/second; Down uses 10px/second. Slow halves those rates. |

The strip offers Play/Pause, Stop & reset, Across/Down, Forward/Backward and Normal/Slow. It pauses on image inspection, another control receiving focus, leaving the visible area, a layout change, opening the viewer, hidden page, image failure or reduced-motion change. Reaching an end stops the pass. The visitor chooses when to resume.

`ui.ts` sets `will-change: transform` during the pass and removes it when stopped. Keep that scope rather than applying a permanent GPU hint across the page. The ordinary image grid remains available and still while the optional strip moves.

The operating system's reduced-motion preference overrides the site's Full/Still choice. Still mode disables transitions, smooth scrolling and reading progress. The optional saved preference expires after 30 days; blocked storage leaves an in-memory choice. It never prevents navigation or viewing.

## Accessibility and reliability contracts

Keep semantic headings, navigation landmarks, labels, native disclosures and normal anchors. The skip link targets the main content. Focus-visible uses a 3px Pomegranate outline with a 5px offset. The native dialog supports Escape, directional navigation, contained keyboard focus and restoration to the opener. At either gallery end, focus moves to an enabled control when Next or Previous becomes disabled.

The mobile menu must remain usable after a breakpoint change. Without JavaScript, ordinary navigation remains visible. Touch, keyboard and mouse should reach the same essential content. Avoid adding information that appears only on hover.

The viewer uses dynamic viewport height with a fallback and safe-area padding. A short landscape rule applies when height is at most 500px and width at least 600px. A container-query enhancement stacks form rows when their container is below 420px; the existing viewport layout still provides a fallback. Forced-colour rules preserve visible boundaries.

Enquiry messages must match the outcome: draft, validation error, pending, uncertain receipt, committed receipt or recovery. The ordinary review remains non-sending. The local integration lab uses synthetic data and fake notifications. A visual button, a successful fetch or an email-link tap cannot establish a booking.

## Change and verification routine

Change a named component or token, then check the visitor task in both review and fixture rendering. Preserve the owner notes in the former and their absence in the latter. For a layout change, include narrow portrait, short landscape, tablet width, desktop and 2560px; test breakpoint neighbours and 200% zoom where available. Use long approved names and blocked fonts/images as cases.

Run type/copy checks, the affected browser journeys and the image-geometry test. Check the menu, viewer ends, error states, reduced motion and no-JavaScript fallback. Review screenshots as well as DOM assertions. Run byte budgets after changing fonts, JavaScript or images. The shell budget does not include image transfer; real-media cold entry and full-story measurement remain required.

Write plain, accurate text. Use no em dashes in authored UI, metadata, alt text, errors or documentation. Retain upstream quotations and licences without treating their examples as project copy. A skilful edit can clarify the owner's facts; it cannot supply missing prices, reviews, rights or delivery promises.
