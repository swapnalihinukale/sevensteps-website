# Writing for Seven Steps

Read [stop-slop](../.agents/skills/stop-slop/SKILL.md) and its linked references before editing text.

Write the guides to the person using them: **your photos**, **your website**, **your email address**. Give the next step and name the file or setting to change. Avoid narrating what “the user”, “the owner” or “the photographer” needs to do.

For visitor-facing pages, use Seven Steps' agreed voice. Confirm whether “I” or “we” fits before writing the introduction. Use the names, services, prices and promises supplied for publication. Keep missing details as specific Add/Replace requests.

## Style

- Use short paragraphs, active verbs and sentence case.
- Keep exact commands, field names and technical conditions that affect a task.
- Explain a limitation where the reader encounters it. Link to the full procedure instead of repeating it across guides.
- Cut praise, generic claims, chat history and announcements about what a document explains.
- Use no em dashes. Rewrite the sentence with a full stop, comma or colon. Check literal characters and encoded forms that render them.

Apply this to visible copy, accessible labels, captions, metadata and documentation. Keep copyright and licence text intact. Record local punctuation edits to bundled references in their provenance files rather than claiming an unchanged upstream copy.

## Examples

| Avoid | Write |
|---|---|
| The photographer should provide accurate contact information. | Add the email address you use for enquiries. |
| The owner can maintain the website through assisted file-based editing. | Edit your text in `site/src/pages/index.astro`. |
| The canonical content register retains unresolved owner inputs. | Use the checklist to track the photos and text you still need to add. |
| This document describes the implemented visual direction. | Change the colours in `site/src/styles/global.css`. |
| Genuine receipt and recovery acceptance remains a separate release gate. | Test that an enquiry reaches your inbox and that you can recover it if email fails. |

Use precise form messages. “Sending your enquiry…” means the request is in progress. “We could not confirm receipt. Try again.” means the result is unknown. Show “We have received your enquiry.” after the server stores it. A stored enquiry does not confirm a booking or email delivery.

## Review checks

| Check | Action |
|---|---|
| COPY-01: source | Scan text and string sources for literal or encoded em dashes. |
| COPY-02: voice and facts | Read in page order. Address the reader, cut repetition and check factual claims. |
| COPY-03: rendered text | Check labels, descriptions, metadata and menu, gallery, form and error states in the browser. |
| COPY-04: release | Review the final text, remove draft notes from public pages and repeat the checks on the build to publish. |

`npm run check` includes `site/scripts/copy-check.mjs` for source and built pages. A character scan cannot assess tone, so read the changes before committing. Use the skill's five-part score during editing and revise below 35/50; the score is a writing aid, not proof that readers understand the page.
