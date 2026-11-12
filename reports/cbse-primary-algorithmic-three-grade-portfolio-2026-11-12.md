# Algorithmic grade-parent portfolio: Classes III–V

This is a bounded original reviewed source-authoring portfolio for three independently reviewed source records in the CBSE CT/AI supplement: generated identifiers G3-LO04, G4-LO04 and G5-LO04. The identifiers are catalogue positions, not official outcome codes. Seventeen task families cover three hierarchical records; they are not seventeen new skills. The companion review authors three Full source dispositions and eight reviewed component associations. No goal, other grade-parent or learner mastery is promoted.

The literal source clauses and original 35-card/44-edge candidate audit remain private. The retained proposal now has an eight-card/six-edge hard closure; the actual 14-pair age/access audit records six support-only/rejected direct associations. Source requirements are following given rules at the specified grade complexity. The tasks below are original implementations, not copies of handbook problems. Official student/teacher materials have been checked for bounded examples; a textbook example is not an extra mandatory clause. The separate whole claims retain all creation, decision, repeat, mapping and arithmetic extras. Stage-end competency familiarity does not automatically establish these grade-parent tasks.

## Delivery and evidence

Use counters, blank state tables, four event cards, paper, pencil and the two original diagrams linked below. Model one stated example and explain intermediate state, relevant condition and stopping rule. Then hide the key and independently assess the changed case. Record actual states, routes or arrangements and the reason for each step; an endpoint without a valid trace is insufficient. During independent assessment the adult does not select the next operation, interpret the condition or correct the current state. If an error occurs, identify the missed rule during teaching and later use a fresh case.

A parent portfolio must cover all five or six relevant families and a fresh integrated transfer, including its grade's complexity. Do not certify a parent by counting associations or by passing only the easiest family. Offer accessible representations and explanation in the configured familiar language without supplying the reasoning.

The [original paths and counting cards](assets/cbse-primary-algorithms/original-paths-and-counting.svg) and [original tower card](assets/cbse-primary-algorithms/original-left-tower-count.svg) are actual printable materials. Keys below are for the adult; conceal them during an independent check. The diagrams were authored from scratch and rendered for inspection; no source figure is reproduced.

## Class III: five complete cases

<a id="g3-number-chain"></a>

1. **Number chain.** Start at 4; add 2, multiply by 3, subtract 5. Record every state: 6, 18, 13. Each operation uses the new state. Changed start 5 gives 7, 21, 16. Reusing the first answer fails transfer.
<a id="g3-shape-path"></a>

2. **Rule-based path.** Nine cells have types C, T, C, T, T, C, T, C, END. Start on cell 1; from C advance three cells, from T advance two; stop on 9. Land on 1, 4, 6, 9. Passed cells are 2, 3, 5, 7, 8: three T and two C. A landing is not a skipped cell. Change cell 4 to C: land on 1, 4, 7, 9; passed cells are 2, 3, 5, 6, 8.
<a id="g3-order-clues"></a>

3. **Event constraints.** Arrange A, B, C, D: A before B; C after B and before D. The unique order is A-B-C-D. Replace A-before-B with B-before-A and add A-before-C: B-A-C-D. Check all clues after the change.
<a id="g3-round-ledger"></a>

4. **Round ledger.** Start with 3 counters. In each of three rounds gain 4, then lose 1. Phase states are 7/6, 10/9, 13/12; finish 12, not the pre-loss 13. Change the loss to 2: 7/5, 9/7, 11/9; finish 9.
<a id="g3-three-accounts"></a>

5. **Transfers.** Begin A=6, B=5, C=4. A gives B two; then B gives C three. States are (4,7,4), then (4,4,7); total 15 is preserved. Change the first transfer to one: (5,6,4), then (5,3,7). Explain why transferring does not create counters.

Independent integrated transfer: start three containers at (5,4,3). Repeat twice: A gives B one; if B then exceeds 5, B gives C two. End-of-round states are (4,5,3) and (3,4,5). The condition uses the updated B; no return occurs at equality. This transfer adds a combined check; it does not require all source families to use branching.

## Class IV: six complete cases

<a id="g4-branch-stop"></a>

1. **Branch and stop.** Begin 3; if odd double it, otherwise add 3. After each update stop once the current value is at least 20. Trace 3,6,9,18,21, then stop. Changed start 4 gives 4,7,14,17,34. Apply the branch to the current value, not the original input.
<a id="g4-grid-trace"></a>

2. **Labelled grid.** Columns A–E run left to right; rows 1–5 run bottom to top; north is marked up. From B2 follow E1, N1, W1, S2, E1: C2,C3,B3,B1,C1. Replace S2 with S1: finish C2. Turn the labelled map and preserve its marked north reference rather than equating compass north with the viewer's current up.
<a id="g4-two-ledgers"></a>

3. **Two ledgers.** Begin A=18, B=20. Each round A gains 4 then loses 3; B gains 1 then loses 2. Three round ends are (19,19), (20,18), (21,17); A first exceeds B at round 2. If B instead gains and loses 2, it remains 20 and A first exceeds it at round 3. Preserve within-round phases.
<a id="g4-swap-state"></a>

4. **Transfer, swap, remove.** Begin (8,8,8). A gives B three; swap the B and C amounts; remove two from A. Trace (5,11,8), (5,8,11), (3,8,11). Removal reduces total 24 to 22; the swap preserves total. Remove two from B instead: final (5,6,11).
<a id="g4-performances"></a>

5. **Order with adjacency.** P before R; R immediately before S; Q after P and before R. Order P-Q-R-S. Replace the Q clue with Q-after-S: P-R-S-Q. A merely relative order does not satisfy an immediate-neighbour condition.
<a id="g4-three-lengths"></a>

6. **Conditional counting.** The diagram's six boxes contain segment lengths A[1,2,3], B[2,2,3], C[1,3,4], D[3,3,3], E[2,4,5], F[1,1,4], on a common unit scale. Count boxes whose three lengths all differ: A,C,E, so 3. Change F to [1,2,4]: now 4 boxes. Count qualifying boxes, not segments. Cardinality or grid naming alone does not establish this explicit rule-following operation.

Independent integrated transfer: begin A=10, B=6. Repeat three rounds: A gives B two; if B is then greater than A, exchange their complete amounts. Trace (8,8), (6,10)→(10,6), (8,8). Equality does not trigger a swap. Explain the changed case if the comparison includes equality; swapping equal amounts changes no visible state but the decision has been taken.

## Class V: six complete cases

<a id="g5-round-branch"></a>

1. **Layered round rule.** Begin 5. For rounds 1,2,3: if current value is odd add 3, otherwise halve; then add the round number. Record the branch result and round end: 8→9, 12→14, 7→10. Changed start 6: 3→4, 2→4, 2→5. Adding the round number before the branch changes the algorithm.
<a id="g5-colour-rule-score"></a>

2. **Conditional directional scoring.** On the labelled grid start B3. Commands are black-E, white-N, black-N, white-W, black-S; black means the stated direction and white the opposite. Stars are C3,D3,D2. Score one for every star visit, excluding start. Trace C3,C2,C3,D3,D2: score 4 because C3 is visited twice. Unique-star scoring gives 3. Changed start B2 under per-visit scoring gives C2,C1,C2,D2,D1: score 1.
<a id="g5-staged-updates"></a>

3. **Staged comparison.** Begin X=24,Y=18. In each of three rounds X transfers two to Y; if Y now exceeds X, return three from Y to X. Trace round 1 (22,20); round 2 (20,22)→(23,19); round 3 (21,21). Equality does not return counters. Change the condition to Y-at-least-X: round 3 ends (24,18).
<a id="g5-order-matters"></a>

4. **Order changes a branch.** Begin (12,9,6). A gives B three; swap B/C amounts; if C exceeds 10, C gives A four. Trace (9,12,6), (9,6,12), (13,6,8); total 27. Swap first, then transfer, then test: (12,6,9), (9,9,9), with no final transfer. Explain the changed branch rather than copy the prior result.
<a id="g5-insufficient-time"></a>

5. **Insufficient time information.** A leaves 10:10 and travels 35 minutes. B arrives 15 minutes before A. D arrives 20 minutes after C; C's arrival is unstated. A arrives 10:45 and B 10:30, but D is not determined. Show two possible C times to explain why. Adding C=10:05 gives D=10:25. Do not invent a connection between C and the unrelated A/B information.
<a id="g5-all-left"></a>

6. **All-left counting.** Six towers A–F have heights [5,2,8,1,7,4] on a common baseline. For each, count shorter towers anywhere to its left: [0,0,2,0,3,2]. C and F have two. Change F's height to 9: its count becomes five, while C remains two. Adjacency-only counting and counting taller/right-side towers miss the given procedure.

Independent integrated transfer: begin (9,6,3). For rounds 1 and 2, transfer one from A to B, then if B exceeds A swap B/C amounts, then add the round number to C. Round 1: (8,7,4). Round 2 transfer gives (7,8,4), swap gives (7,4,8), then add two: (7,4,10). The added counters change the total; transfers/swaps do not. Reverse the order of the comparison and transfer and trace the new states afresh.

## Complete support for missing saved guides

Seven current hard-closure cards have no saved teaching-research guide. The following supports make the broader whole claims implementable without narrowing them. The other saved current operational constraints and assessments remain in the complete review packet; source success awards none automatically.

**Computers in Everyday Life / Step-by-Step Instructions:** Reuse the complete original protocols in the reviewed digital operational resource. Identify five declared computer-containing devices, explain instruction-following/information-processing and sort changed examples; do not infer hidden electronics from appearance. For precise instructions, a learner directs an adult executor to arrange two blocks and a tray, tests an omitted/reordered step, repairs it and explains why a computer cannot guess an unstated step.

**Decisions and repeats:** Model three repetitions of “place one counter, tap the table.” Then supply red/blue cards with a declared if-red/otherwise sorting decision. Independently follow a new four-round sequence, identify the repeated part and explain the decision's effect. Describe a familiar routine with a genuine decision and repetition. If the pupil always takes the first branch, compare the actual card/condition and reteach with a different set. A straight-line task alone does not certify the whole claim.

**Following number algorithms:** Use the actual [original number flowcharts](assets/cbse-primary-algorithms/original-number-flowcharts.svg). Independently execute the whole-card parity example from 7: 7,8,4,2,1, stopping at 1. Contrast a supplied rule “if greater than 50 subtract 10, otherwise double” on 34,51,80: outputs 68,41,70. Explain which test is made and when. The learner then creates a different finite algorithm with an explicit comparison, repeat and stop rule; trace it and explain its pattern. Model one first: begin 2, add 3 while the next value would remain below 20; list 2,5,8,11,14,17 and stop before 20. A copied fixed instruction list does not establish independent algorithm creation or termination reasoning.

**Grid references / Finding places / Reading and drawing maps:** Use a familiar classroom or supplied declared park plan. Teach a top-down representation, labelled landmarks, a key and a stable orientation. The learner locates the door/desk or three park landmarks, draws and describes a route, then constructs their own labelled 5×5 grid over the plan and lists three feature references. Independently describe A1→D3 with compass directions and identify a marked C4. Distinguish cells from crossing points; state row/column conventions rather than invent them. Change the start and rotate the whole labelled plan while retaining north. Follow a separate forward-three/left/forward-two route with a declared initial facing direction. Whole map production, key/labels and relative-location explanations remain required; finding an endpoint on a supplied grid alone is insufficient.

**Other complete claims:** Ordering Events in Time retains first/next/last, yesterday/today/tomorrow and morning/afternoon usage in ordinary actual occasions, not only abstract letter constraints. Multi-step operation choice retains independent operation/method selection, all four operations and error diagnosis through the reviewed reasoning portfolio; following a supplied transfer operation alone does not certify it. Keep all shared arithmetic/spatial ancestor criteria and hard paths unchanged.

## Proposed association/context boundary for review

Fourteen tentative pairs were audited. Retain Decisions/repeats and Following number algorithms for all three parents, plus Grid references for Classes IV/V: eight proposed component pairs in eight grade-specific 8–9, 9–10 and 10–11 contexts. Reject the three Multi-step operation choice pairs: following supplied rules does not directly assess that claim’s independent operation/method choice, and its current hard path includes older formal division/multiplication duties. Keep the three Ordering Events in Time contributions as support only: the selected tasks assess satisfying supplied ordering constraints, not the complete chronological/deictic-language repertoire. The Classes IV/V source permits attribute-based or chronological clues, so that whole temporal repertoire is not a universal source gate. Preserve all event/clock task families and teach the needed local terms without publishing a direct time pair. No entire operation-choice or temporal claim is awarded. The former’s whole necessity review remains separate; no edge has been weakened to clear an easier source fragment. Following conditional counting procedures is a direct algorithm operation; plain cardinality and grid naming are prerequisite support rather than substitutes.

If these exact contexts are approved, generated compatibility ends would extend for Decisions/repeats (6–8→6–11), Following number algorithms (8–10→8–11), Grid references (9–10→9–11)  . Ordering events remains 4–8 with no new context; it is supporting vocabulary here. The rejected Multi-step operation choice offer remains unchanged at 8–12 and receives no new parent association. All old authored intervals, claims, guides and hard edges must be preserved. These prospective effects are disclosed for semantic review; the companion authoring batch implements only the exact reviewed contexts/projections, with no new topic or unreviewed parent promotion.
