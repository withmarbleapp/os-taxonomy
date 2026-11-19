// The standard controls for moments: the answer buttons, the hint, "try it"
// after help, and the tools for an answer given by tapping things in order.
//
// A lesson's page supplies the elements (so it decides where they sit) and
// this wires them to the model, so every lesson answers, hints and resumes the
// same way. Elements a lesson leaves out are simply not used.
//
//   <div id="choices" hidden></div>
//   <button id="hint" hidden>…</button>
//   <button id="resume" hidden>…</button>
//   <div id="order-tools" hidden><output id="order-draft"></output>
//     <button id="order-clear">…</button><button id="order-check">…</button></div>
//   <form id="fields-form" hidden><input id="FIELD-ID">… <button id="fields-check">…</button></form>
// For a fill-in question each box is an <input> whose id is the field's id.
// `ids` renames the standard elements for a page that already has its own.
// `retryLabel`, when given, also offers the resume button after an answer,
// with that label, so the child can ask for another try themselves.
export function bindMoments({ model, questionFor, root = document, retryLabel, ids = {} }) {
  const $ = (id) => root.getElementById(ids[id] ?? id);
  const on = (id, handler) => $(id) && ($(id).onclick = handler);
  on('hint', () => model().hint());
  on('resume', () => model().resume());
  on('order-clear', () => model().clear());
  on('order-check', () => model().check());
  if ($('fields-form'))
    $('fields-form').onsubmit = (event) => {
      event.preventDefault();
      model().check();
    };
  let drawn = '',
    resumeLabel;
  // Call on every render with the model's snapshot.
  return function update(snapshot, cover = false) {
    const s = snapshot.state,
      question = questionFor(s),
      show = (id, visible) => $(id) && ($(id).hidden = !visible);
    const choosing = !cover && s.canAnswer && !!question?.choices;
    if ($('choices')) {
      const key = question?.choices ? question.id + '|' + question.choices.join('|') : '';
      if (key !== drawn) {
        drawn = key;
        $('choices').replaceChildren(
          ...(question?.choices ?? []).map((label, i) => {
            const button = document.createElement('button');
            button.id = 'choice' + i;
            button.className = 'control';
            button.textContent = label;
            button.onclick = () => model().answer(i);
            return button;
          }),
        );
      }
    }
    show('choices', choosing);
    show('hint', !cover && s.canHint);
    // "Try it" appears after help; after an answer the tutor decides on a retry.
    show('resume', !cover && s.canResume && (!s.revealed || !!retryLabel));
    if (retryLabel && $('resume')) {
      resumeLabel ??= $('resume').textContent;
      $('resume').textContent = s.revealed ? retryLabel : resumeLabel;
    }
    const ordering = !cover && s.canAnswer && !!question?.order;
    show('order-tools', ordering);
    if (question?.order) {
      if ($('order-draft'))
        $('order-draft').textContent = s.draft.map((id) => question.order.find((o) => o.id === id).label).join(' → ');
      if ($('order-check')) $('order-check').disabled = s.draft.length !== question.order.length;
    }
    // Boxes to fill: what is typed goes to the model, and the model's entries
    // (which a spoken answer can also set) come back into the boxes.
    const filling = !cover && s.kind === 'ask' && !!question?.fields;
    show('fields-form', filling);
    for (const field of question?.fields ?? []) {
      const input = root.getElementById(field.id);
      if (!input) continue;
      const value = s.entries.find((e) => e.field === field.id)?.value ?? '';
      if (root.activeElement !== input || !s.canAnswer) input.value = value;
      input.disabled = !s.canAnswer;
      input.oninput = () => model().enter(field.id, input.value);
    }
    if (question?.fields && $('fields-check')) $('fields-check').disabled = !s.canAnswer;
    return { choosing, ordering, filling, question };
  };
}
