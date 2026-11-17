# Writing teaching.json

`teaching.json` is the lesson's subject knowledge in the form the tutor reads.
The whole file is placed in the tutor's instructions for every decision, so it
is written for the tutor: compact, specific to this subject, and free of
anything the tutor does not need. Research provenance, sources and reasoning
for later authors go in the design note.

## What reads each field

| Field | Checked by `validate` | Used by the player | Purpose |
|---|---|---|---|
| `id` | Must equal the manifest `id` | | Identity |
| `dialogue.mode` | Must be `adaptive-general` | | |
| `learningGoals[]` | At least one; unique `id`s | | What the lesson is for. Each goal's `criteria` are read by the tutor |
| `dialogue.focuses[]` | At least one; each `goals` entry must name a goal | The allowed values when the tutor records what a child's words showed | The strands the tutor tracks understanding against |
| `selfEvaluation.skills[]` | | The allowed values when the tutor invites or records confidence; with none, those tools are not offered | Skills the child can reflect on |
| `observationEvents[]` | Each must exist in `experience.json` events | A learner event with one of these names prompts the tutor to respond | Which child actions deserve a response |
| `evidenceEvents[]` | Each must exist in `experience.json` events | | Which events count as evidence |
| `teaching[]` | Each `action` must exist in `experience.json` | The moments offered through `explain_model`; with none, that tool is not offered | Tutor-worded moments only. Leave it empty in a lesson-worded lesson |
| `tutorGuidance` | A string under 16,000 characters | | The map (see below) |
| `introduction`, `curriculum`, `observationPrompt`, criteria and anything else | | | Read by the tutor as part of the file |

Passing `validate` shows the references are consistent. It says nothing about
whether the content can be taught from: the starter passes with no teaching
content at all.

## Skeleton

Replace every value. Names in capitals must match `manifest.json` and
`experience.json`.

```json
{
  "schemaVersion": 1,
  "id": "LESSON-ID",
  "curriculum": ["TOPIC-ID"],
  "introduction": {
    "objective": "What we will find out, in words the child would use.",
    "successCriteria": "What the child could explain or do by the end."
  },
  "learningGoals": [
    {
      "id": "first-relationship",
      "objective": "One relationship, stated as something the child can explain or do.",
      "criteria": [
        {
          "id": "names-the-link",
          "lookFor": ["Own words that connect A with B."],
          "notEnough": [
            "A correct choice made after the answer was shown.",
            "Repeating the tutor's sentence."
          ]
        }
      ]
    }
  ],
  "dialogue": {
    "mode": "adaptive-general",
    "focuses": [{ "id": "first", "goals": ["first-relationship"] }]
  },
  "selfEvaluation": {
    "skills": [
      {
        "id": "explain-first",
        "description": "Explain the first relationship.",
        "prompt": "How do you feel about explaining it on your own?",
        "focuses": ["first"]
      }
    ]
  },
  "observationEvents": ["EVENT-NAME"],
  "evidenceEvents": ["EVENT-NAME"],
  "observationPrompt": "What a committed answer does and does not establish in this lesson.",
  "teaching": [],
  "tutorGuidance": "See the next section."
}
```

## Evidence criteria

Give each goal `lookFor` and `notEnough`. `notEnough` is where the lesson tells
the tutor what help, exposure, luck or repetition cannot establish, which is the
part a tutor most often gets wrong on its own. Write both as things a child
would actually say or do in this scene.

## tutorGuidance: the map

This is the difficulty map from the design note, compressed for the tutor. The
Moon lesson's is a good model: a numbered list of relationships, each saying

- when it is worth showing, and which action shows it;
- what the child can do with it, and which activity or check offers that;
- what counts as evidence, and what does not;
- what to return to when help is needed.

Then add the subject facts the tutor must not get wrong, and the limits of the
model (what it does not compute, so the tutor does not claim it).

Open it by saying the map is used adaptively. Keep it to the subject, the
evidence and this lesson's tools. How to converse, when to reflect and when to
stop are already in the shared tutor's instructions, and a second copy here can
only disagree with them.

## Where "when to use" lives

- **Lesson-worded moments (the default)** are ordinary actions in
  `experience.json`. Put when each is useful, and what the child can contribute,
  in the action's `description`, and name the actions in the `tutorGuidance`
  map. The action returns the authored `speech`.
- **Tutor-worded moments** are entries in `teaching[]`: `id`, `action`, `args`,
  optional `state` (conditions the scene must meet), `text`, and the optional
  `whenToUse` and `learnerContribution` that the tutor sees when choosing.

## Reflection skills

Each skill names something the child actually practised and lists the focuses
it relates to. Phrase the `prompt` about the work ("How do you feel about
counting a whole layer on your own?"), with no reference to finishing.
