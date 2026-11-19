// teaching.json is written from here so the long guidance stays readable. Run after editing.
import { writeFile } from 'node:fs/promises';
const tutorGuidance = [
  'Use this map adaptively; it is a set of opportunities, not an order. The opening shows Mia seeing a rainbow: it poses the question and proves nothing about the child. Every show_moment speaks a short authored explanation and hands back to you in the same turn: follow it with one small thing for the child to notice, answer or do. Checks and activities speak their own exact words; wait for the child afterwards.',
  '1. SUNLIGHT AND DROPS TOGETHER. Worth showing when the child says rainbows come "after rain" or "from the Sun" alone. start_activity sun_and_rain lets them tap the two clouds and watch Mia’s window. Small checks: see_rainbow with cloud_over_sun or water_off. Evidence: says both are needed and why one alone fails. Tapping until a rainbow appears shows only that they found it.',
  '2. WHAT ONE DROP DOES. If the child does not know what the drops do, show inside_drop (bends in, bounces off the back, bends out on the Sun’s side). The child can then aim_sunbeam: wherever the beam goes in, the colours leave on the Sun’s side. Small check: drop_exit. Evidence: own words that light goes in and comes back out towards the Sun’s side. "It reflects like a mirror" is partly right: the bounce is a reflection, but the bending on the way in and out is what spreads the colours.',
  '3. WHERE THE COLOURS COME FROM. For "the water makes the colours", "the rain paints it" or a child who asks why it is coloured, show colours_spread. Small check: drop_colours. Evidence: says the colours were already in the sunlight and the drop spreads them apart. Listing the colour names is not this.',
  '4. SUN BEHIND YOU, DROPS IN FRONT. Rests on 2: because drops send light back towards the Sun’s side, Mia must stand on that side and look away from the Sun. turn_to_find isolates where she looks; walk_around isolates where she stands (she keeps facing the rain). Small checks: sun_where, or see_rainbow with sun_behind, far_side, side_on or facing_sun. Evidence: explains the Sun must be behind her, ideally linking it to light coming back out of the drops. A goal_reached event shows she reached the arrangement, with its assisted flag; ask what she noticed before treating it as understanding.',
  '5. TRANSFER. Once 1 and 4 look secure, start_check see_rainbow with the situation fresh gives a new arrangement with Mia’s window covered and no arrows; start it again for more practice at the same demand. make_rainbow is harder: a fountain, the Sun on the other side, everything free. A child who already explains Sun-behind-and-drops-in-front at the start can go straight to a fresh see_rainbow or make_rainbow and skip the demonstrations; one correct unassisted prediction with a reason is enough to skip 1 and 4, not 2 and 3.',
  '6. DEEPER, each only when its prerequisite is in place. why_a_bow (after 4): the drops that send colour sit on a circle round the line Sun, head, shadow; then reach_rainbow asks whether Mia can walk to it, and walk_around lets the child watch that the bow belongs to where she stands. red_on_top (after 2 and 3): higher drops send red, lower send violet. high_sun (after 4): at midday the circle is below the ground; sun_height lets the child lift the Sun and watch the bow sink; see_rainbow high_sun checks it.',
  'HELP ON CURRENT WORK. sunlight_path draws the light on the child’s own arrangement and says why Mia does or does not see a rainbow; inside_drop and colours_spread open the close-up without losing the meadow. Then resume_activity returns to the same work, now recorded as assisted. For a wrong answer, look at screen.mia.why in the scene (no_sunlight, no_drops, drops_elsewhere, looking_away, sun_too_high) and work on that one thing. A corrected answer is the current one; the earlier attempt stays as history and the retry is assisted.',
  'SPOKEN ANSWERS. For a clear spoken answer to a pending question call answer_check with its sceneId, the index of the choice meant and the child’s words. If unclear, ask which they mean. A two-choice answer establishes only that one relationship, and a correct one may be a guess.',
  'AN OWN-WORDS EXPLANATION of how a rainbow forms would connect: sunlight is many colours; it goes into raindrops, bends, bounces back and spreads into colours; so you see it with the Sun behind you and the rain in front. Partial versions are normal at eight; note which link is present. Checks 1 to 4 give evidence about single links before asking for the whole story.',
  'FACTS TO KEEP RIGHT. The drops do not make or add colour; they separate colours already in sunlight. Light bends because it changes speed entering and leaving water; "bends" is enough for this child, and "refraction" is optional. Most light passes straight through a drop (the faint dotted line); the rainbow is the part that bounces once inside. Red is on the outside (top) of the bow, violet inside. A rainbow is not an object in a place: it is light reaching one person’s eyes, so it is drawn only in Mia’s window and never in the meadow, each person sees their own, and nobody can reach its end. The bow is a circle centred on the point opposite the Sun (the shadow of your head); the ground cuts it off. Say "about 42 degrees" only if the child asks for a number.',
  'LIMITS OF THIS MODEL. Sizes and distances are illustrative and the Sun is drawn close. The bow in Mia’s window and the colour fan leaving the drop are drawn wider than in nature. Not modelled: the fainter second bow, brightness, drop size, mist or fog bows, moonlight. If the child asks about a double rainbow, say truthfully it comes from light bouncing twice inside the drops and that this model does not show it. Refer to things by what is visible: the yellow arrows of sunlight, the coloured arrows going to Mia, the white circle, the dotted line, Mia’s window.',
].join('\n');
const teaching = {
  schemaVersion: 1,
  id: 'how-rainbows-form',
  releaseId: 'how-rainbows-form-lesson-v2',
  experienceReleaseId: 'how-rainbows-form-v2',
  curriculum: ['mt_qzGADV-NGe', 'mt_gLy3ZgZWiN'],
  introduction: {
    objective: 'Find out how sunlight and raindrops make a rainbow, and where you have to stand to see one.',
    successCriteria: 'Explain what a raindrop does to sunlight, and make a rainbow appear for Mia.',
  },
  learningGoals: [
    {
      id: 'sun-and-drops',
      objective: 'Explain that a rainbow needs sunlight and water drops in the air at the same time.',
      criteria: [
        {
          id: 'both-needed',
          lookFor: [
            'Own words that say both sunlight and drops are needed, for example "the cloud blocked the Sun so the drops had no light".',
            'Predicts no rainbow when the Sun is covered or the water is off, and says which one is missing.',
          ],
          notEnough: [
            'Tapping the clouds until a rainbow appears.',
            'Saying "rain" or "Sun" alone.',
            'A correct Yes/No with no reason, or after sunlight_path showed the answer.',
          ],
        },
      ],
    },
    {
      id: 'inside-a-drop',
      objective: 'Describe what a raindrop does to sunlight: the light goes in and bends, bounces off the back, and comes out again spread into colours that were already in the sunlight.',
      criteria: [
        {
          id: 'light-comes-back',
          lookFor: [
            'Own words for the journey: in, bounce, back out on the Sun’s side.',
            'Uses the close-up to point out where the light bounces or where it comes out.',
          ],
          notEnough: ['Repeating the tutor’s sentence.', 'Choosing "Back on the Sun’s side" after the full path was shown.'],
        },
        {
          id: 'colours-were-in-sunlight',
          lookFor: ['Says sunlight already has the colours in it and the drop spreads or splits them.', 'Rejects the idea that the water makes or paints the colours, with a reason.'],
          notEnough: ['Naming the colours of the rainbow in order.', 'Saying "the drop makes a rainbow" without saying where the colours come from.'],
        },
      ],
    },
    {
      id: 'where-to-stand',
      objective: 'Explain that you see a rainbow with the Sun behind you and the drops in front of you.',
      criteria: [
        {
          id: 'sun-behind',
          lookFor: [
            'Own words that the Sun must be behind and the rain in front, in a new arrangement as well as the first one.',
            'Links it to the drop: the light comes back out towards the Sun’s side, so you have to be on that side.',
            'An unassisted correct prediction with a reason, or building the rainbow at the fountain without a hint and saying what mattered.',
          ],
          notEnough: [
            'Dragging Mia until the rainbow appears, without saying what changed.',
            'A lucky Yes/No.',
            'A correct answer after a hint or after the result was shown (assisted).',
            'Saying a rainbow is "in" the rain or at a place you can walk to.',
          ],
        },
      ],
    },
  ],
  dialogue: {
    mode: 'adaptive-general',
    focuses: [
      { id: 'ingredients', goals: ['sun-and-drops'] },
      { id: 'drop', goals: ['inside-a-drop'] },
      { id: 'colours', goals: ['inside-a-drop'] },
      { id: 'position', goals: ['where-to-stand'] },
      { id: 'explanation', goals: ['sun-and-drops', 'inside-a-drop', 'where-to-stand'] },
    ],
  },
  selfEvaluation: {
    skills: [
      { id: 'what-is-needed', description: 'Say what is needed for a rainbow.', prompt: 'How do you feel about saying what you need to get a rainbow?', focuses: ['ingredients'] },
      { id: 'drop-story', description: 'Tell what happens to sunlight inside a raindrop.', prompt: 'How do you feel about telling what the light does inside a raindrop?', focuses: ['drop', 'colours'] },
      { id: 'find-a-rainbow', description: 'Work out where to stand and look to see a rainbow.', prompt: 'How do you feel about working out where to stand to see a rainbow?', focuses: ['position', 'explanation'] },
    ],
  },
  observationEvents: ['response_committed', 'goal_reached'],
  evidenceEvents: ['response_committed', 'goal_reached'],
  observationPrompt:
    'Respond to the latest committed answer or reached goal (a rainbow found in an activity), with its assisted flag and, for answers, whether it came by voice. A two-choice answer establishes only the one relationship asked about. goal_reached means the arrangement was reached, not that the child can say why; invite what they noticed. Moving Mia or tapping clouds without a result is not evidence. Use screen.mia.why from the current scene for focused feedback.',
  teaching: [],
  tutorGuidance,
};
await writeFile(new URL('../teaching.json', import.meta.url), JSON.stringify(teaching, null, 2) + '\n');
console.log('tutorGuidance', tutorGuidance.length, 'chars');
