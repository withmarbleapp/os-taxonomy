// What a session has established about the child, worked out from recorded
// evidence by fixed rules. The wrap-up screen shows it, the session log keeps
// it, and whatever later tracks a child across lessons reads the same record.
//
// One entry per skill the lesson declares (teaching.selfEvaluation.skills),
// each in one of four states:
//
//   own   shown on their own   an 'understood' reading that did not rest on help
//   help  done with help       'understood', but only on work the lesson marked assisted
//   seen  looked at together   the skill came up (a question, a difficulty, a
//                              demonstration acknowledged) without being shown
//   none  not yet              nothing recorded
//
// The tutor supplies the readings (records.mjs) as it goes. It does not choose
// the state: whether a reading rested on help is stamped by the runtime from
// the lesson's own event, so a tutor cannot turn assisted work into "on your
// own" by describing it kindly.
export const STATES = ['own', 'help', 'seen', 'none'];

// Facts the runtime adds to a reading when it is recorded. `origin` is what
// began the turn, `work` is the child's latest committed work (the last of the
// lesson's evidence events, with the lesson's own `assisted` flag) and
// `sceneId` is the task now on screen.
//
// Nothing here can be earned by default. A reading taken from committed work
// with no evidence event behind it counts as helped, and so do the child's
// words while the work they are talking about was itself helped.
export function stampRecord(record, { origin, work, sceneId }) {
  const helped = work?.data?.assisted === true;
  if (origin !== 'observation') {
    const sameTask = sceneId !== undefined && work?.data?.sceneId === sceneId;
    return { ...record, basis: 'words', assisted: helped && sameTask };
  }
  return { ...record, basis: 'work', event: work?.name, assisted: work ? helped : true };
}

const FALLBACK = {
  seen: 'We looked at this together.',
  none: 'We haven’t tried this one yet.',
};

// `learning` is the session's stamped readings; `notes` maps a skill id to a
// child-facing line the tutor wrote for it ("You said: …").
export function outcomeFor(pkg, learning = [], notes = {}) {
  const skills = pkg.teaching.selfEvaluation?.skills ?? [],
    goalsOf = Object.fromEntries(pkg.teaching.dialogue.focuses.map((f) => [f.id, f.goals ?? []]));
  const rows = skills.map((skill) => {
    const records = learning.filter((r) => skill.focuses.includes(r.focus)),
      understood = records.filter((r) => r.interpretation === 'understood'),
      independent = understood.filter((r) => !r.assisted),
      state = independent.length ? 'own' : understood.length ? 'help' : records.length ? 'seen' : 'none',
      best = (independent.at(-1) ?? understood.at(-1))?.evidence;
    return {
      skill: skill.id,
      title: skill.description,
      state,
      // A line for the child. A note only stands where there is evidence for it.
      proof: (state !== 'none' && notes[skill.id]) || best || FALLBACK[state] || FALLBACK.seen,
      goals: [...new Set(skill.focuses.flatMap((f) => goalsOf[f] ?? []))],
    };
  });
  return {
    lesson: pkg.teaching.id,
    topics: pkg.teaching.curriculum ?? [],
    skills: rows,
    shown: rows.filter((r) => r.state === 'own').length,
    complete: rows.length > 0 && rows.every((r) => r.state === 'own'),
    // What to offer next: the first skill not yet shown independently.
    next: rows.find((r) => r.state !== 'own')?.skill ?? null,
  };
}
