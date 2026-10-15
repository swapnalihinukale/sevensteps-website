# Track enquiries and bookings

Use a private spreadsheet to see whether your Seven Steps site brings suitable work and helps your team reply. Start with the [blank CSV](templates/enquiry-register.csv). No analytics service or tracking code is needed. Keep real client records outside this repository.

## Set up your sheet

Choose one question to investigate: better-fit enquiries, fewer repeated questions or faster replies. Name the person updating the sheet and a backup.

On a Definitions tab, record what makes an enquiry suitable, what confirms a booking, your working hours and retention period. Date changes to those definitions. Count a booking when your agreed confirmation condition is met, not when someone clicks contact or shows interest.

Use one row per intended assignment. Combine repeat messages across channels under the same ID. A retried form with the same receipt counts once. Exclude test, spam and duplicate rows from business totals.

## Column guide

Keep these names and order to use the supplied CSVs and formula:

| Column | Enter |
|---|---|
| `measurement_id` | Random ID without names or event details. Keep any link to a client/receipt in separate restricted records. |
| `record_type` | `genuine`, `test`, `spam`, `duplicate` |
| `received_at_utc` | First confirmed email or database receipt time. Do not record a button click as receipt. |
| `source` | `website_self_reported`, `instagram`, `referral`, `search_self_reported`, `returning_client`, `other`, `unknown`. Use what the client told you or a verified fact; omit full tracking URLs. |
| `service`, `event_month`, `region` | Broad service, `YYYY-MM` month and region; use `unknown` if missing. Omit exact venues and private event details. |
| `qualification` | `qualified`, `unsuitable`, `pending`, `unknown`, using your agreed service/date/location criteria. Missing budget alone is not a rejection. |
| `qualification_reason` | Confirmed code: `scope_fit`, `service_scope`, `date_capacity`, `travel_scope`, `budget_mismatch_confirmed`, `awaiting_details`, `unknown` |
| `first_response_at_utc` | First useful human reply or next step. Leave blank until someone replies; exclude automated acknowledgements. |
| `consultation_at_utc` | Consultation date if you held one. You can quote without a consultation. |
| `quote_at_utc`, `quote_value_inr` | First substantive quote date and current comparison value in INR if known. Keep revisions in your private quote history. |
| `booking_at_utc`, `booking_value_inr` | Confirmed booking date and value if known. A tentative hold does not count. |
| `outcome` | `open`, `booked`, `declined_by_client`, `declined_by_studio`, `no_reply`, `unknown`. Use `no_reply` after your agreed follow-up process. |
| `outcome_reason` | A confirmed/volunteered reason code or `unknown`; do not guess why someone declined. |
| `next_review_on`, `last_updated_at_utc` | Next follow-up date and latest update time |

Use category dropdowns and check dates/nonnegative amounts. Blank amounts mean missing information, not zero. Import times as numeric spreadsheet date-times in UTC; the examples use `YYYY-MM-DD HH:MM:SS`. Keep client free text and untrusted spreadsheet formulas out of the sheet.

## Compare enquiries with enough time to decide

Choose a reporting date `T`. Use your usual enquiry-to-decision time to choose `H`, the number of days before comparing outcomes. Write down the reason and use the same `H` for both periods. Compare enquiries received by `T minus H days`; show newer enquiries as still waiting for a decision.

For each period, count:

- `N`: genuine received enquiries, including unresolved ones.
- `Q`, `U`, `P`, `K`: qualified, unsuitable, pending and unknown. Check `Q + U + P + K = N`.
- `Quotes` and `Bookings`: distinct enquiry IDs with those events, without counting revisions twice.

| Measure | Calculation |
|---|---|
| Qualified share of received | `Q / N`; show pending and unknown counts |
| Qualification coverage | `(Q + U) / N` |
| Qualified share among assessed | `Q / (Q + U)`; show it beside coverage |
| Quote share | `Quotes / N` |
| Booking share | `Bookings / N`; keep unresolved enquiries in the denominator |
| Quote-to-booking share | Bookings with a recorded quote / enquiries with a recorded quote, given equal time to decide. Show bookings without recorded quotes separately. |
| Response time | Hours to the first human reply; show median, answered count and unanswered count. Add a tail measure only with enough observations. |
| Known values | Sum known quoted/booked amounts and show how many are missing. Keep quotes, confirmed bookings and collected revenue separate. |

Show counts beside percentages and use `N/A` for a zero denominator. In column T, this formula calculates response hours from the CSV's C and J columns:

```text
=IF(OR(C2="",J2="",NOT(ISNUMBER(C2)),NOT(ISNUMBER(J2))),"",IF(J2<C2,"CHECK TIMES",(J2-C2)*24))
```

It includes nights and weekends. Use a business-hours calculation only after defining your calendar and holidays. For unanswered enquiries, show their age at `T` instead of a response time. Preserve booking dates if a later cancellation occurs; record cancellations/refunds separately.

## Try the synthetic example

The [example CSV](templates/enquiry-register-synthetic.csv) contains three invented enquiries, not Seven Steps results. Use 15 November 2026 and `H = 30 days` for this exercise only.

One enquiry is qualified, quoted and booked; one is unsuitable; one remains open/unknown. Qualified and booking shares are each `1/3` (33%). Coverage is `2/3` (67%); qualified share among assessed is `1/2` (50%). Replies took one and four hours, giving a median of 2.5 hours across **two answered, one unanswered**. The unresolved row still counts. Amounts are blank, so the example makes no price or revenue claim. Keep these rows out of your real sheet.

## Review and choose a change

Reconstruct past enquiries only where your records support the dates and outcomes. Mark missing details unknown and note differences in record quality.

At your agreed review interval, update stale rows and check exclusions. Compare periods with equal time to decide, and account for service mix, season, available dates and source. With a small sample, inspect specific problems before claiming an uplift or starting an A/B test.

Choose one change you can support: clarify service copy after repeated mismatches, answer a recurring question, or add responder cover for slow replies. Record who will change it, the date, website version, measure and next review. Keep other changes visible in the notes.

If you later track economics, use collected revenue, related fulfilment costs and your team's hours. Keep tax, cancellations and time periods consistent. Gross booking value does not establish profit.

## Keep client information private

IDs do not make this sheet anonymous if your team can link them to clients. Restrict row-level access; protect the identity mapping separately. Follow [your retention/deletion process](LAUNCH.md#8-back-up-restore-and-delete-data), including exports and backups.

Share aggregates with the approved team. Combine small categories that could identify a client, and keep row-level CSVs, messages and screenshots out of GitHub or public notes. Use the database/mailbox to confirm receipt and the sheet to track follow-up. A later analytics service needs a reason and your approval before collecting or sharing more data.
