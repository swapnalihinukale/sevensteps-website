# Enquiry and business measurement

Prepared on 15 October 2026. Start with one small manual register in the owner's approved private workspace. No analytics library, tracking pixel, cookie or new service is required. This document defines a method; it records no real enquiries or business results.

The purpose is to learn whether the site helps the photographer receive suitable work and respond well. Traffic, a contact-button click, an email application opening and a provider notification are not bookings. The [execution plan](../EXECUTION-PLAN.md) keeps the commercial objective open until the owner supplies evidence about the business.

## Responsibilities and first setup

The owner chooses one initial question, such as whether the site attracts suitable assignments, answers recurring client questions or reduces time spent responding. The responder maintains the register after each meaningful contact or status change. A named backup covers absence. The owner and maintainer review aggregate results at an interval suited to enquiry volume and the usual booking decision period.

Before collecting a baseline, agree the definition of a qualified enquiry, the real booking-confirmation condition, the business timezone, working hours, outcome categories and data retention. Record these on a short Definitions tab with an effective date. If a definition changes, version it rather than silently recategorizing old cohorts.

Use one row per genuine enquiry about an intended assignment. Merge repeat messages about the same assignment, including contacts across channels, under one measurement ID. A safe retry returning the same website receipt is still one enquiry. Test submissions, spam and duplicates must not inflate totals.

Use the [blank CSV](templates/enquiry-register.csv) as a column guide. Keep the real workbook and any identity mapping outside this repository. The [example CSV](templates/enquiry-register-synthetic.csv) contains only invented rows to demonstrate the method. Do not import those examples into a live baseline.

## Minimal register

| Column | Meaning and handling |
|---|---|
| `measurement_id` | Random internal identifier with no name, initials, email or event detail. Keep any link to a receipt/contact only in the restricted operating record. |
| `record_type` | `genuine`, `test`, `spam` or `duplicate`. Exclude the latter three from commercial metrics. |
| `received_at_utc` | First confirmed receipt of the genuine enquiry. For email, use the actual received message; for a form, use the durable record. A click is insufficient. |
| `source` | `website_self_reported`, `instagram`, `referral`, `search_self_reported`, `returning_client`, `other` or `unknown`. Record what the client said or an existing bounded operational fact. Do not infer a source from an email address or store full referrer/tracking URLs. |
| `service`, `event_month`, `region` | Broad service, month and region buckets that help assess fit/capacity. Use `unknown` when missing. Avoid exact venue, address or private event narrative. |
| `qualification` | `qualified`, `unsuitable`, `pending` or `unknown`. Qualification concerns agreed service, place/date feasibility and other owner-defined fit criteria. Missing budget is not automatically unsuitable. |
| `qualification_reason` | A bounded reason code such as `scope_fit`, `service_scope`, `date_capacity`, `travel_scope`, `budget_mismatch_confirmed`, `awaiting_details` or `unknown`. Only record a reason supported by the exchange. |
| `first_response_at_utc` | First meaningful human reply addressing the enquiry or a next step. An automated receipt does not count. Leave blank until it happens. |
| `consultation_at_utc` | Actual consultation if one occurs. Optional: a direct-to-quote enquiry does not need this step. |
| `quote_at_utc`, `quote_value_inr` | Date of the first substantive quote and its current agreed comparison value in INR if known. Keep a separate private quote history when needed. Blank means unavailable, not zero. |
| `booking_at_utc`, `booking_value_inr` | Date the owner's documented confirmation condition was met and confirmed value if known. Interest, an unanswered quote or a tentative date hold does not count. |
| `outcome` | `open`, `booked`, `declined_by_client`, `declined_by_studio`, `no_reply` or `unknown`. Keep outcome separate from qualification. Mark `no_reply` only after the owner's agreed follow-up process; it is not proof of a reason. |
| `outcome_reason` | A bounded volunteered/confirmed reason code, or `unknown`. Do not write speculation about affordability or a competitor. |
| `next_review_on`, `last_updated_at_utc` | A follow-up review date and last update time. These keep unresolved enquiries visible without treating them as losses. |

For all date/time columns, use spreadsheet date-time values in UTC. The CSV examples use `YYYY-MM-DD HH:MM:SS`; verify import produces numeric date-time cells before calculating intervals. Display local time in the operating tool if useful, without mixing zones in calculations. Month buckets use `YYYY-MM`.

Use dropdowns for categories and validate dates/nonnegative amounts. Do not paste client text into the register. Import the supplied CSV as data, and keep untrusted strings beginning with spreadsheet formula characters out of cells. No formula should fetch an external URL or send data.

## Definitions and calculations

Choose a reporting cutoff `T` and a maturity window `H` from the observed enquiry-to-decision period. Document the rationale and keep the same `H` for a comparison. A cohort contains genuine enquiries received in the same period. Its mature subset contains rows received on or before `T minus H days`. Recent rows remain visible as immature rather than disappearing from the report.

Use the following counts for a stated cohort or mature subset:

- `N`: all genuine received enquiries in that subset, including pending/unknown outcomes.
- `Q`: qualified enquiries. `U`: unsuitable enquiries. `P`: pending qualification. `K`: unknown qualification. Check that `Q + U + P + K = N`.
- `Quotes`: enquiries with a recorded quote. `Bookings`: enquiries meeting the confirmation condition. Count distinct measurement IDs, not quote revisions or notifications.

| Measure | Calculation and interpretation |
|---|---|
| Qualified share of received | `Q / N`. Report `P` and `K` alongside it, since missing classification can depress the observed share. |
| Qualification coverage | `(Q + U) / N`. This shows how much of the received cohort the team has assessed. |
| Qualified share among assessed | `Q / (Q + U)`. Show with coverage; it is not a replacement for the received-cohort measure. |
| Quote share | `Quotes / N`. Direct-to-quote journeys count. A consultation is not a required denominator. |
| Booking share of received | `Bookings / N`. Use mature cohorts for comparisons and show remaining open/unknown counts. Do not exclude unresolved cases to improve the rate. |
| Quote-to-booking share | Booked enquiries with a recorded quote divided by enquiries with a recorded quote, in a stated equally mature cohort. Separately show bookings without a recorded quote rather than inventing one. |
| First response time | Hours from confirmed receipt to first meaningful human reply. Report median and a tail measure when the sample supports it, plus number answered and number awaiting response. |
| Known quoted/booked value | Sum the known relevant amounts and report how many amounts are missing. Label quoted, confirmed and collected amounts separately. A quoted price is not revenue. |

Return `N/A` when a denominator is zero. Show the underlying counts with each percentage. Do not convert missing amounts or timestamps to zero. For the supplied column order, a first-response-hours helper in column T can use:

```text
=IF(OR(C2="",J2="",NOT(ISNUMBER(C2)),NOT(ISNUMBER(J2))),"",IF(J2<C2,"CHECK TIMES",(J2-C2)*24))
```

This measures elapsed hours, including nights and weekends. A business-hours measure needs the owner's actual working calendar and holidays; do not subtract guessed hours. For an unanswered enquiry, show current age separately as `T minus received_at_utc`, with no completed response-time value. This prevents fast answered cases from hiding old unanswered work.

A cancellation or refund after booking needs an explicit later status/history in the restricted operating record. Preserve the original booking event and report cancellations/net collected value separately. Do not rewrite historical confirmation dates to make rates look better.

## Synthetic worked example

The example CSV has three invented genuine enquiry rows received on 1 and 2 October 2026. For demonstration only, use a cutoff of 15 November 2026 and `H = 30 days`; this is not a recommended decision window for the photographer.

One row is qualified, quoted and booked, with a human reply after one hour. One is unsuitable for the offered service, with a reply after four hours. One remains open with unknown qualification and no recorded human reply. All three are mature in this example.

The received-cohort qualified and booking shares are each `1 / 3`, or about 33%. Qualification coverage is `2 / 3`, or about 67%. Among assessed enquiries, qualified share is `1 / 2`, or 50%. The unanswered enquiry still counts in the denominator. Median response time among the two answered rows is 2.5 hours, which must be shown alongside `2 answered, 1 unanswered`; it does not describe the unanswered client's experience. Monetary values are blank, so the example makes no pricing or revenue claim.

## Baseline and review routine

1. The responder reconstructs recent enquiries only where the existing records support it. A small reliable baseline is useful; missing information stays unknown. If retrospective coverage differs from the new register, label the limitation.
2. At each review, reconcile duplicate/test/spam exclusions, stale open rows, missing qualification and timestamps. Confirm the data cutoff and definitions before interpreting the results.
3. Compare enquiry cohorts with equal maturity. Where practical, separate service, broad source and season/capacity. A changed service mix, available-date mix, referral campaign or festival season can explain a change without the website causing it.
4. Read the counts, pending/unknown share, response coverage and known outcomes together. With few enquiries, investigate specific process problems instead of claiming statistical uplift. Do not run an A/B test whose traffic cannot support a useful conclusion.
5. Choose one supported improvement and record its hypothesis, owner, scope, change date, intended measure and later review point. Keep the release/content version in the review note. Keep other material changes visible so the comparison remains interpretable.

Examples of decisions: repeated scope mismatch may call for clearer service copy; repeated questions may justify a useful FAQ; slow human replies call for responder coverage; relevant enquiries that stall after a quote require a conversation about the cause. Low enquiry volume alone does not justify heavier animation or another tracking tool.

If the owner can supply reliable economics later, add collected revenue, directly attributable fulfilment cost and owner hours to the private operating records. Review contribution and workload alongside booking count. Keep taxes, pass-through costs, cancellations and the measurement period consistent. Do not claim profit from gross booking value.

## Privacy and sharing

This register removes direct identifiers but is still pseudonymous while someone can link its IDs, dates or rare assignments to people. Treat it as restricted personal/business data. Only designated responders, the owner and approved analysts should access the detailed workbook. Keep any mapping to names, emails or receipts separate and protected.

Agree numeric retention, deletion responsibility and backup handling through the [operating runbook](LAUNCH.md#8-back-up-restore-and-delete-data). Delete or aggregate expired rows under that policy. Remove identifying detail from small groups before sharing aggregate results outside the authorized team; combine sparse categories when needed. Do not publish row-level CSVs, customer messages or identifiable screenshots in GitHub, project notes or analytics.

Website operational receipts remain the source for whether the form accepted an enquiry. The manual register is a business follow-up record and must not replace the durable database, mailbox or deletion process. Tracking adoption, new analytics accounts and third-party data sharing would be separate decisions supported by a demonstrated need and the owner's approval.
