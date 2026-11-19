# Duration and clock claim review

This semantic proposal follows the [conversion-family review](time-conversion-retired-topic-mappings-2026-11-10.json), at base `af2f158ce96edc2bcf87df9d343529d93e0b961f`. The underlying accepted curriculum snapshot is `691911d03f5531cc798ee391c86b778a735d75ab`. It retains every active duration/clock topic ID, creates no topics, and makes no learner or database changes. The [machine ledger](time-duration-clock-claim-review-2026-11-10.json) records before/after cards, exact context changes, edge changes and preserved requirements.

## Independent operations, rather than grade tiers

| Stable ID | Resulting claim | Distinguishing evidence |
| --- | --- | --- |
| `mt_4emC463IyW` | Calculate elapsed duration from two known clock instants | Given 2:50 and 4:10, return an interval of 80 minutes, rather than another clock reading. |
| `mt_IL86kadLSS` | Find a start or finish time from an interval and one instant | Given start 2:50 and duration 80 minutes, return 4:10; given finish 4:10 and duration 80 minutes, return 2:50. |
| `mt_6XCURuNwPw` | Compare and order durations | Order supplied or measured durations, use common units and distinguish duration from finish order. |
| `mt__N55B7u7HD` | Measure and record an event duration | Given a suitable timer, estimate in an appropriate unit, align timer start and stop with the event, read and record the measurement; compare an estimate with it. |
| `mt_UNzojLkNdm` | Read and write ordinary clock time to the nearest minute | Coordinate both hands, including an hour hand near the next numeral; translate past/to and digital readings. |
| `mt_5J2quSTspi` | Interpret Roman-numeral clock faces | Interpret I–XII, IV/IIII and IX while keeping ordinary hand positions. |
| `mt_WfrE_4r-kY` | Interpret and convert ordinary 12/24-hour representations | Both directions, analogue and digital, including 07:05, 15:20, 12:20 at noon and 00:20 after midnight. |

The two arithmetic topics differ in the unknown quantity and the story-to-operation decision: an interval versus a clock instant. A learner may count between known endpoints yet fail to predict a finish, or predict a finish yet fail to derive and express an interval. These contrasts are assessment design hypotheses, not evidence about any learner. Sample each independently, including backward endpoint tasks and a new context; success on one does not establish the other. Same-hour and cross-hour tasks are examples within these claims, not separately tracked levels. A number line is useful; correct subtraction with base-60 regrouping is also valid.

The former supplied-duration comparison in `4em` and mixed-unit comparison in `UNzo` remain in `6XCUR`. The former estimate/time/check activity in `UNzo` remains in `N55`, whose prompt now asks for actual performance rather than merely reciting a time fact. The former ordinary 12/24 conversion in the Roman bundle remains in `Wfr`, including both 12 o’clock exceptions. Roman interpretation is not a prerequisite for ordinary clock-system conversion.

## Scoped associations and limits

Existing unaffected intervals are preserved separately. The ledger lists the complete changed rows; it does not require a future contribution to retain today's dataset totals.

- `IL86` retains AU 9–12, Ontario 9–10 and US 8–9. Its GB 8–9 Year 4 M/6 link is removed: that clause concerns unit conversion and already has the conversion holder `mt_d8al9JcajP`. No age-only row is invented and no broader claim is lowered to GB 7–8.
- `4em` retains its GB 7–8 elapsed-duration contribution and AU 8–9 duration/unit-relation contribution. The AU association is a component application, not new proof that endpoint calculation is independently mandated or that the whole expectation is Full.
- `UNzo` retains the genuine AU clock-reading code, Ontario, GB and US clock-reading contributions. AU unit-relation/estimation contribution moves to `N55` and `6XCUR` at 8–9. `N55` receives GB 7–8 and US 8–9 measurement contributions; `6XCUR` receives GB 7–8 comparison contributions. Their existing earlier intervals remain separate.
- NCERT C-8.10's measurement contribution moves from `UNzo` to `N55` at the exact IN **3–8** stage window. The calendar contribution remains unchanged. This band denotes official stage scope with stage-end attainment, not identical performance due at each age. The [India report](ncert-foundational-mathematics-alignment-2026-11-10.md) distinguishes its original review from this follow-up; its Partial judgment and month-interval condition remain. No new Full certification is made.
- The AU 10–11 conversion link leaves the Roman-only topic because the unchanged exact-band link already survives on `Wfr`. The GB 7–8 Roman component stays on `5J2`; no earlier band is copied into the broader `Wfr` claim.

An arithmetic topic's timetable association contributes to duration calculation; it does not certify independent itinerary planning. Measurement requires actual performance with a supplied suitable timer; independent instrument selection is not newly required. Reading/writing clock values does not newly require physically setting a clock. Supplied digital times or interval values do not universally require mastery of complete analogue nearest-minute reading. Accordingly, whole-clock hard gates become optional support for the relevant input representation. Timer operation similarly supports acquiring durations but does not gate ordering supplied values. Grade-sequence and thematic edges are removed or qualified; exact changes appear in the ledger.

## Other bounded corrections

`mt_EXlmTURK_o` remains the existing time/calendar knowledge collection. Its blanket leap-year statement is corrected to a usual four-year pattern with calendar exceptions. A supplied calendar can establish a particular year's length; neither century arithmetic nor orbital explanation becomes a new assessment requirement. Optional explanatory background does not substitute for the fact collection's evidence.

`mt_TcG90kS8nu` now explicitly supplies a common start before asking who was quicker, and contrasts this with unknown start times. Finishing earlier alone does not establish a shorter duration.

Changed active teaching guidance is reconciled with the resulting claims. Existing citations and confidence/verification flags are inherited metadata, not fresh verification of a study or validation of newly proposed activities. `5J2` had no active research record at the base; no research coverage is invented for it.

## Source checks and consumer boundary

The official [England mathematics programme](https://www.gov.uk/government/publications/national-curriculum-in-england-mathematics-programmes-of-study/national-curriculum-in-england-mathematics-programmes-of-study) distinguishes Year 3 duration comparison, clock reading and Roman faces from Year 4 clock-system and unit conversion. School-year sequence does not itself establish a hard mastery dependency. [Common Core measurement standards](https://www.thecorestandards.org/Math/Content/MD/) combine clock reading, interval measurement and interval arithmetic within one source standard; this does not make them one taxonomy claim. The [US Naval Observatory leap-year explanation](https://aa.usno.navy.mil/faq/leap_years) confirms that the Gregorian four-year pattern has exceptions. Accepted ACARA text and the pinned NCERT source artifact were also read; restricted source wording is not reproduced here.

This is a claim-curation proposal, not an alignment-only publication. Narrowed IDs and redistributed evidence require a consumer compatibility and reassessment review before deployment. Historical estimates and observations do not automatically prove either resulting arithmetic operation or a relocated requirement. No learner reset, state migration, evidence averaging or automatic mastery transfer is authorized by this PR.
