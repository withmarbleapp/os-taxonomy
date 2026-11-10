import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=n=>JSON.parse(readFileSync(new URL('../'+n,import.meta.url)));
// Reviewed source-position binding, including nongraded scope, real material/
// performance panels, and deliberately conditional form alternatives.
const expected=[
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG1-LO01",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-1"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-1"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "movement-and-sound-cues"
    ],
    "taskPanel": "sound-cued-body-recall",
    "taskConditions": {
      "actualObserveRecogniseRecall": true,
      "differentHeardSounds": true,
      "movementModelRemovedForRecall": true
    },
    "topicIds": [
      "mt_k-UuT5CUZ4",
      "mt_K8pUme6BWW",
      "mt_OTFABm2xdf"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG1-LO02",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-1"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-1"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "cleanliness-and-body-needs"
    ],
    "taskPanel": "cleanliness-and-health-value",
    "taskConditions": {
      "practicalHygieneAndNeedsReasoning": true,
      "valueNotForcedPleasantFeeling": true
    },
    "topicIds": [
      "mt_vbbxnY7ZDT",
      "mt_cxJRc15osy"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG12-LO01",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-12"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-12"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "material-inquiry-and-generalisations"
    ],
    "taskPanel": "material-patterns",
    "taskConditions": {
      "actualMaterialFeatureDiscrimination": true,
      "ownMaterialPattern": true,
      "wholeRuleContinuationCreationChecksSeparate": true
    },
    "topicIds": [
      "mt_auVZZEuXjs",
      "mt_xppl18avyY",
      "mt_WXW0hjNhph"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG12-LO02",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-12"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-12"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "movement-and-sound-cues"
    ],
    "taskPanel": "gross-motor-arts",
    "taskConditions": {
      "actualControlledLocomotorPatterns": true,
      "actualStaticAndDynamicBalance": true,
      "noImportedTimedNorm": true
    },
    "topicIds": [
      "mt_k-UuT5CUZ4",
      "mt_K8pUme6BWW"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG12-LO03",
    "disposition": "ConditionalArtFormBinding",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-12"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-12"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "form-bound-creative-production"
    ],
    "taskPanel": "imaginative-selected-form",
    "taskConditions": {
      "actualOwnImaginativeProductionAndVariation": true,
      "selectedFormBinding": true,
      "alternativesNotUniversalAND": true
    },
    "topicIds": [],
    "conditionalTopicIds": [
      "mt_2Kn5ianVWN",
      "mt_2mb17lUCPD",
      "mt_hu_OZPduxP",
      "mt_ylFTYS80d1"
    ]
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG12-LO04",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-12"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-12"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "cross-subject-connections-and-transfer"
    ],
    "taskPanel": "cross-subject-transfer",
    "taskConditions": {
      "actualNewPriorConceptConnection": true,
      "actualStrategyUseInDifferentSubjectContext": true,
      "subjectNamesAloneInsufficient": true
    },
    "topicIds": [
      "mt_32B7xjUPwF",
      "mt_99G6Msdzw-"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG12-LO05",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-12"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-12"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "cultural-encounter-and-celebration"
    ],
    "taskPanel": "folk-arts-discussion",
    "taskConditions": {
      "actualAccuratelyAttributedFolkArtsMusicCulture": true,
      "discussionOfRelevantFeatures": true,
      "appreciationNotCompulsoryPositiveMood": true,
      "noPerformanceMasteryInferredFromDiscussion": true
    },
    "topicIds": [
      "mt_DkzsZdyaL2",
      "mt_S0hzjAeLSK",
      "mt_YbX3LD0Eca"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG12-LO06",
    "disposition": "ConditionalArtFormBinding",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-12"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-12"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "form-bound-creative-production"
    ],
    "taskPanel": "aesthetic-creative-selected-form",
    "taskConditions": {
      "actualOwnCompositionAndPurposefulChange": true,
      "selectedFormBinding": true,
      "noAdultTasteScore": true
    },
    "topicIds": [],
    "conditionalTopicIds": [
      "mt_2Kn5ianVWN",
      "mt_2mb17lUCPD",
      "mt_hu_OZPduxP",
      "mt_ylFTYS80d1"
    ]
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG13-LO01",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-13"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-13"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "listening-and-ordered-instructions"
    ],
    "taskPanel": "arts-listening",
    "taskConditions": {
      "actualPeerListeningAndReadAloudComprehension": true,
      "realRelevantResponse": true,
      "quietComplianceInsufficient": true
    },
    "topicIds": [
      "mt_YbX3LD0Eca",
      "mt_mLPEMpYb_R"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG13-LO02",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-13"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-13"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "movement-and-sound-cues"
    ],
    "taskPanel": "instruction-coordinated-movement",
    "taskConditions": {
      "actualBodyPartsCoordinatedWithInstructions": true,
      "actualSoundMovementCues": true,
      "wholeMovementBalanceRhythmSeparate": true
    },
    "topicIds": [
      "mt_r-BgS-lqTe",
      "mt_k-UuT5CUZ4",
      "mt_K8pUme6BWW",
      "mt_OTFABm2xdf"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG13-LO03",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-13"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-13"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "story-making-and-dramatisation"
    ],
    "taskPanel": "creative-story-completion",
    "taskConditions": {
      "actualOwnCoherentStoryEnding": true,
      "wholeFamiliarStoryRetellingAndAdaptationSeparate": true
    },
    "topicIds": [
      "mt_9V8Z386RDx"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG13-LO04",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-13"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-13"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "story-making-and-dramatisation"
    ],
    "taskPanel": "dramatic-still-images",
    "taskConditions": {
      "actualNonSpeakingEmbodiedTableau": true,
      "changedDramaticRelation": true,
      "meaningShownOrExplained": true,
      "drawingNotSubstitute": true,
      "wholeTheatrePortfolioSeparate": true
    },
    "topicIds": [
      "mt_ylFTYS80d1"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG13-LO05",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-13"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-13"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "story-making-and-dramatisation"
    ],
    "taskPanel": "group-story-dramatisation",
    "taskConditions": {
      "actualCollaborativeStoryDrama": true,
      "ownRolesIdeasAndFairPart": true,
      "purposefulVoiceAction": true,
      "wholeTheatrePortfolioSeparate": true
    },
    "topicIds": [
      "mt_ylFTYS80d1",
      "mt_QxsoqVUt6u"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG13-LO06",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-13"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-13"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "collaboration-and-respectful-response"
    ],
    "taskPanel": "peer-art-response",
    "taskConditions": {
      "actualPeerWorkResponse": true,
      "differentLegitimateOpinions": true,
      "reasonsAndRespect": true,
      "praiseAgreementNotCompulsory": true
    },
    "topicIds": [
      "mt_S0hzjAeLSK",
      "mt_wzUzVEBqJb",
      "mt_YbX3LD0Eca",
      "mt_QxsoqVUt6u"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG13-LO07",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-13"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-13"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "visual-material-processes"
    ],
    "taskPanel": "actual-card-poster-design",
    "taskConditions": {
      "actualOwnCardOrPoster": true,
      "visualPurposeAndRevision": true,
      "writingNotRequiredByThisSourcePosition": true
    },
    "topicIds": [
      "mt_2Kn5ianVWN"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG13-LO08",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-13"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-13"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "art-task-organisation"
    ],
    "taskPanel": "art-organisation",
    "taskConditions": {
      "actualOwnPlanResourcesAndOrderedExecution": true,
      "actualResultReview": true,
      "wholeCheckingChainSeparate": true,
      "noManufacturedError": true
    },
    "topicIds": [
      "mt_QR3vxbN1o4"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG13-LO09",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-13"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-13"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "natural-and-chosen-sound-panels"
    ],
    "taskPanel": "own-sound-small-instruments",
    "taskConditions": {
      "actualSmallInstrumentOutput": true,
      "ownAudibleChoicesAndRevision": true,
      "instrumentConstructionNotRequired": true,
      "bodyOnlyNotSubstitute": true
    },
    "topicIds": [
      "mt_2mb17lUCPD"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG13-LO10",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-13"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-13"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "visual-material-processes"
    ],
    "taskPanel": "actual-imprint-texture-product",
    "taskConditions": {
      "actualObjectPrintingOrImpression": true,
      "actualTextureComparison": true,
      "actualCardOrBookmarkUsingImprints": true,
      "sortingOrPaintedImitationInsufficient": true
    },
    "topicIds": [
      "mt_2Kn5ianVWN",
      "mt_6msyXavNJf",
      "mt_auVZZEuXjs"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG13-LO11",
    "disposition": "ContextualAffectiveRequirement",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-13"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-13"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "contextual-arts-enjoyment"
    ],
    "taskPanel": "enjoyment-context",
    "taskConditions": {
      "accessibleVoluntaryArtsOpportunities": true,
      "contextualEnjoymentNotBinaryMastery": true,
      "noForcedLikingAllActivities": true
    },
    "topicIds": [],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG2-LO01",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-2"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-2"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "surrounding-shapes-and-properties"
    ],
    "taskPanel": "shapes-colours-surroundings",
    "taskConditions": {
      "actualSurroundingShapesAndColours": true,
      "shapeSizeOrientationVariation": true,
      "wholeCountingSortingChecksSeparate": true
    },
    "topicIds": [
      "mt_KJeEeTutJI",
      "mt_xppl18avyY"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG2-LO02",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-2"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-2"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "visual-material-processes"
    ],
    "taskPanel": "lines-materials",
    "taskConditions": {
      "actualLines": true,
      "differentMaterials": true,
      "deliberateToolAdjustment": true
    },
    "topicIds": [
      "mt_6msyXavNJf"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG2-LO03",
    "disposition": "SkillWithContextualEngagement",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-2"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-2"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "natural-and-chosen-sound-panels"
    ],
    "taskPanel": "recognise-natural-sounds",
    "taskConditions": {
      "actualAccuratelyAttributedNaturalSounds": true,
      "sourceRecognitionNotJustImitation": true,
      "appreciationContextual": true
    },
    "topicIds": [
      "mt_ppENoD8vf1",
      "mt_S0hzjAeLSK"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG2-LO04",
    "disposition": "SkillWithContextualEngagement",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-2"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-2"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "natural-and-chosen-sound-panels"
    ],
    "taskPanel": "body-sound-production",
    "taskConditions": {
      "actualBodySound": true,
      "ownChoiceAndAudibleVariation": true,
      "bodyAppreciationContextual": true
    },
    "topicIds": [
      "mt_2mb17lUCPD",
      "mt_OTFABm2xdf"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG2-LO05",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-2"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-2"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "visual-material-processes"
    ],
    "taskPanel": "actual-clay-object",
    "taskConditions": {
      "actualClayManipulation": true,
      "ownObjectDesignAndDescription": true,
      "flatDrawingNotSubstitute": true
    },
    "topicIds": [
      "mt_2Kn5ianVWN"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG3-LO01",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-3"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-3"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "listening-and-ordered-instructions"
    ],
    "taskPanel": "give-follow-arts-instructions",
    "taskConditions": {
      "actualOrderedFollowing": true,
      "wholeGiveClarifyAndCheckSeparate": true,
      "actualUseLanguage": true
    },
    "topicIds": [
      "mt_r-BgS-lqTe"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG3-LO02",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-3"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-3"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "local-nature-recognition"
    ],
    "taskPanel": "plants-animals-around-us",
    "taskConditions": {
      "actualPlantAnimalIdentification": true,
      "accurateLocalHabitatExamples": true,
      "wholeMicrohabitatChecksRetained": true
    },
    "topicIds": [
      "mt_ppENoD8vf1"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG3-LO03",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-3"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-3"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "sound-properties-and-context"
    ],
    "taskPanel": "pitch-volume-source-fit",
    "taskConditions": {
      "actualPitchAndVolumeDistinction": true,
      "controlledSourceVibrationWholeChecks": true,
      "noNoiseOrPitchMatchingInference": true
    },
    "topicIds": [
      "mt_KTSoXcO7OL",
      "mt__00ZSLnB7p"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG3-LO04",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-3"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-3"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "sound-properties-and-context"
    ],
    "taskPanel": "sound-noise-context",
    "taskConditions": {
      "noiseRemainsSound": true,
      "sameSoundDifferentSuppliedPurposes": true,
      "newSourceTransfer": true,
      "limitedEverydayInterpretationNotPublisherDefinition": true,
      "noUniversalMusicTasteOrLoudnessRule": true
    },
    "sourceInterpretation": "Bounded everyday contextual unwanted/interfering-sound interpretation; not claimed to be an explicit NCERT publisher definition. Actual surrounding source and complete pinned-source text contain no contrary ordered/irregular-vibration definition.",
    "topicIds": [
      "mt_u-Cp7JuK9R"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG4-LO01",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-4"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-4"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "people-work-and-dignity"
    ],
    "taskPanel": "people-work-and-care",
    "taskConditions": {
      "actualRolesAndContributions": true,
      "paidUnpaidDistinct": true,
      "actualRespectfulCare": true
    },
    "topicIds": [
      "mt_PJE57bAvMG",
      "mt_asRwlPZXC3",
      "mt_lAvS72LOUO"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG4-LO02",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-4"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-4"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "people-work-and-dignity"
    ],
    "taskPanel": "dignity-and-contribution",
    "taskConditions": {
      "workContributionAndDignity": true,
      "noOccupationWorthRanking": true,
      "actualRespectfulAction": true
    },
    "topicIds": [
      "mt_PJE57bAvMG",
      "mt_asRwlPZXC3",
      "mt_lAvS72LOUO"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG4-LO03",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-4"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-4"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "describing-emotions"
    ],
    "taskPanel": "describe-emotions",
    "taskConditions": {
      "actualMeaningfulEmotionDescription": true,
      "noManufacturedUpset": true,
      "tearsNotFailure": true
    },
    "topicIds": [
      "mt_kvrvpQris4"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG4-LO04",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-4"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-4"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "cultural-encounter-and-celebration"
    ],
    "taskPanel": "celebrations-diversity",
    "taskConditions": {
      "homeOrSuppliedFamilyCelebration": true,
      "accurateCommunityComparisonAndMeanings": true,
      "noForcedPrivateOrReligiousDisclosure": true
    },
    "topicIds": [
      "mt_zbEcwd40uv",
      "mt_1kdEZRLyaZ",
      "mt_DkzsZdyaL2"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG4-LO05",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-4"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-4"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "collaboration-and-respectful-response"
    ],
    "taskPanel": "actual-peer-support",
    "taskConditions": {
      "actualSharedWork": true,
      "ownAndOtherIdeas": true,
      "fairCompletedPartAndSupport": true
    },
    "topicIds": [
      "mt_QxsoqVUt6u",
      "mt_FwI7q7DSIx",
      "mt_YbX3LD0Eca"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG6-LO01",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-6"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-6"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "visual-material-processes"
    ],
    "taskPanel": "fine-art-handling",
    "taskConditions": {
      "actualDeliberateFineControl": true,
      "markAndCutShapeJoinPortfolio": true,
      "noAlphabetOrGripNorm": true
    },
    "topicIds": [
      "mt_6msyXavNJf",
      "mt_FtCLISvSGw"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG6-LO02",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-6"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-6"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "environment-care-and-reuse"
    ],
    "taskPanel": "environment-care",
    "taskConditions": {
      "actualCarefulObservationAndCare": true,
      "plantAnimalNeeds": true,
      "noUnknownOrganismHandling": true,
      "appreciationNotForcedFeeling": true
    },
    "topicIds": [
      "mt_L1469gt34A",
      "mt_LTb0ZReMR2"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG6-LO03",
    "disposition": "ConditionalArtFormBinding",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-6"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-6"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "form-bound-creative-production"
    ],
    "taskPanel": "free-artistic-expression",
    "taskConditions": {
      "actualOwnFreelyChosenArt": true,
      "selectedFormBinding": true,
      "alternativesNotUniversalAND": true
    },
    "topicIds": [],
    "conditionalTopicIds": [
      "mt_2Kn5ianVWN",
      "mt_2mb17lUCPD",
      "mt_hu_OZPduxP",
      "mt_ylFTYS80d1"
    ]
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG6-LO04",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-6"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-6"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "collaboration-and-respectful-response"
    ],
    "taskPanel": "actual-peer-support",
    "taskConditions": {
      "actualSharedWork": true,
      "ownAndOtherIdeas": true,
      "fairCompletedPartAndSupport": true
    },
    "topicIds": [
      "mt_QxsoqVUt6u",
      "mt_FwI7q7DSIx",
      "mt_YbX3LD0Eca"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG6-LO05",
    "disposition": "ConditionalArtFormBinding",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-6"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-6"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "form-bound-creative-production"
    ],
    "taskPanel": "cards-posters-or-roleplay",
    "taskConditions": {
      "actualCreativeRoute": true,
      "allowedRoutes": [
        "visual-card-poster",
        "dramatic-roleplay"
      ],
      "selectedRouteBinding": true,
      "alternativesNotUniversalAND": true
    },
    "topicIds": [],
    "conditionalTopicIds": [
      "mt_2Kn5ianVWN",
      "mt_ylFTYS80d1"
    ]
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG6-LO06",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-6"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-6"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "material-origins"
    ],
    "taskPanel": "natural-material-origins",
    "taskConditions": {
      "actualObjectMaterialOriginLinks": true,
      "wholeNaturalMadeAndFibreChecks": true,
      "inheritedFairTestCheckedSeparately": true
    },
    "topicIds": [
      "mt_i8AGTuk4fJ"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG6-LO07",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-6"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-6"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "environment-care-and-reuse"
    ],
    "taskPanel": "environment-protection-action",
    "taskConditions": {
      "actualEnvironmentProtectiveAction": true,
      "actualCarefulReuseOrWasteLimit": true,
      "wholeNeedsMinibeastAndToolChecksSeparate": true
    },
    "topicIds": [
      "mt_L1469gt34A",
      "mt_LTb0ZReMR2",
      "mt_FtCLISvSGw"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG6-LO08",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-6"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-6"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "visual-material-processes"
    ],
    "taskPanel": "local-art-observation",
    "taskConditions": {
      "actualAttributedLocalArtwork": true,
      "actualColourShapePatternDiscussion": true,
      "ownWholeVisualPatternTasksSeparate": true
    },
    "topicIds": [
      "mt_2Kn5ianVWN",
      "mt_WXW0hjNhph",
      "mt_S0hzjAeLSK"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG7-LO01",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-7"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-7"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "material-inquiry-and-generalisations"
    ],
    "taskPanel": "raw-material-inquiry",
    "taskConditions": {
      "actualSafeMaterialExplorationAndClassification": true,
      "ownBoundedGeneralisation": true,
      "newCaseAndPossibleCounterexample": true,
      "observationsNotUnlimitedProof": true
    },
    "topicIds": [
      "mt_auVZZEuXjs",
      "mt_xppl18avyY",
      "mt_hbe_kdE_7C"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG7-LO02",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-7"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-7"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "material-inquiry-and-generalisations"
    ],
    "taskPanel": "raw-material-classification",
    "taskConditions": {
      "actualMaterialRecognitionAndCategorisation": true,
      "relevantObservedProperties": true,
      "wholeCountAndCategoryOrderSeparate": true
    },
    "topicIds": [
      "mt_auVZZEuXjs",
      "mt_xppl18avyY"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG7-LO03",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-7"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-7"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "surrounding-shapes-and-properties"
    ],
    "taskPanel": "surrounding-properties-connections",
    "taskConditions": {
      "actualShapeSizeColourRelationToSurroundings": true,
      "ownExplainedConnection": true
    },
    "topicIds": [
      "mt_KJeEeTutJI",
      "mt_xppl18avyY",
      "mt_32B7xjUPwF"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG7-LO04",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-7"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-7"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "listening-and-ordered-instructions"
    ],
    "taskPanel": "listening-observing",
    "taskConditions": {
      "actualListeningAndCloseObservation": true,
      "simpleEquipment": true,
      "describedComparedRelevantDetails": true
    },
    "topicIds": [
      "mt_YbX3LD0Eca",
      "mt_vJO5Bxk4z-"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG8-LO01",
    "disposition": "SkillWithContextualEngagement",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-8"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-8"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "cultural-encounter-and-celebration"
    ],
    "taskPanel": "local-cultural-awareness",
    "taskConditions": {
      "accurateConcreteLocalCulturalKnowledge": true,
      "ownReasonedResponse": true,
      "interestAppreciationContextual": true
    },
    "topicIds": [
      "mt_DkzsZdyaL2",
      "mt_S0hzjAeLSK"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG8-LO02",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-8"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-8"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "listening-and-ordered-instructions"
    ],
    "taskPanel": "classroom-observation-discussion",
    "taskConditions": {
      "actualObservation": true,
      "reasonedClassroomDiscussion": true,
      "responseToOtherContribution": true
    },
    "topicIds": [
      "mt_vJO5Bxk4z-",
      "mt_S0hzjAeLSK",
      "mt_YbX3LD0Eca"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG8-LO03",
    "disposition": "ConditionalArtFormBinding",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-8"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-8"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "form-bound-creative-production"
    ],
    "taskPanel": "visit-observation-artwork",
    "taskConditions": {
      "actualAccessibleVisitOrAccurateVirtualRecord": true,
      "actualObservationAndAppraisal": true,
      "creativeRepresentationOfObservedFeatures": true,
      "selectedFormBinding": true
    },
    "topicIds": [
      "mt_vJO5Bxk4z-",
      "mt_S0hzjAeLSK"
    ],
    "conditionalTopicIds": [
      "mt_2Kn5ianVWN",
      "mt_2mb17lUCPD",
      "mt_hu_OZPduxP",
      "mt_ylFTYS80d1"
    ]
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG9-CG10-LO01",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-9",
      "CG-10"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-9",
        "CG-10"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "listening-and-ordered-instructions"
    ],
    "taskPanel": "speaking-listening-arts",
    "taskConditions": {
      "actualComprehensionAndOwnSpokenContribution": true,
      "meaningfulArtsContext": true,
      "actualLanguageMaterialBinding": true
    },
    "topicIds": [
      "mt_YbX3LD0Eca",
      "mt_mLPEMpYb_R",
      "mt_S0hzjAeLSK"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG9-CG10-LO02",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-9",
      "CG-10"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-9",
        "CG-10"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "functional-arts-vocabulary"
    ],
    "taskPanel": "functional-arts-vocabulary",
    "taskConditions": {
      "actualAcquiredArtsVocabulary": true,
      "ownSpeechAndWriting": true,
      "newContextUse": true,
      "noFixedEnglishLexicon": true
    },
    "topicIds": [
      "mt_NP101Zl-4g"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG9-CG10-LO03",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-9",
      "CG-10"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-9",
        "CG-10"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "cultural-encounter-and-celebration"
    ],
    "taskPanel": "local-cultural-diversity",
    "taskConditions": {
      "actualAccurateLocalCultureEncounter": true,
      "differentLegitimatePracticesAndResponses": true,
      "knowledgeRespectNotForcedFeeling": true
    },
    "topicIds": [
      "mt_DkzsZdyaL2",
      "mt_S0hzjAeLSK",
      "mt_wzUzVEBqJb"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG9-CG10-LO04",
    "disposition": "ConditionalArtFormBinding",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-9",
      "CG-10"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-9",
        "CG-10"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "form-bound-creative-production"
    ],
    "taskPanel": "aesthetic-creative-selected-form",
    "taskConditions": {
      "actualOwnCompositionAndPurposefulChange": true,
      "selectedFormBinding": true,
      "noAdultTasteScore": true
    },
    "topicIds": [],
    "conditionalTopicIds": [
      "mt_2Kn5ianVWN",
      "mt_2mb17lUCPD",
      "mt_hu_OZPduxP",
      "mt_ylFTYS80d1"
    ]
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG9-CG10-LO05",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-9",
      "CG-10"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-9",
        "CG-10"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "cultural-encounter-and-celebration"
    ],
    "taskPanel": "celebrations-dramatisation",
    "taskConditions": {
      "actualRecognitionRelatingDiscussionAndDramatisation": true,
      "accurateCelebrationOrRitualContext": true,
      "wholeScriptPoemImprovisationSeparate": true,
      "noForcedReligiousParticipation": true
    },
    "topicIds": [
      "mt_zbEcwd40uv",
      "mt_1kdEZRLyaZ",
      "mt_ylFTYS80d1"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG9-CG10-LO06",
    "disposition": "SkillWithContextualEngagement",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-9",
      "CG-10"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-9",
        "CG-10"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "collaboration-and-respectful-response"
    ],
    "taskPanel": "togetherness-diversity",
    "taskConditions": {
      "actualCooperationAndRespectForDiversity": true,
      "togethernessContextual": true,
      "noFeelingInferenceFromSmiles": true
    },
    "topicIds": [
      "mt_DkzsZdyaL2",
      "mt_QxsoqVUt6u",
      "mt_wzUzVEBqJb",
      "mt_FwI7q7DSIx"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG9-CG10-LO07",
    "disposition": "Full",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-9",
      "CG-10"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-9",
        "CG-10"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "movement-and-sound-cues"
    ],
    "taskPanel": "gross-motor-arts",
    "taskConditions": {
      "actualControlledLocomotorPatterns": true,
      "actualStaticAndDynamicBalance": true,
      "noImportedTimedNorm": true
    },
    "topicIds": [
      "mt_k-UuT5CUZ4",
      "mt_K8pUme6BWW"
    ],
    "conditionalTopicIds": []
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-SYL-FS-CG9-CG10-LO08",
    "disposition": "ConditionalArtFormBinding",
    "recordKind": "syllabusLearningOutcome",
    "tableScope": [
      "Balvatika",
      "Grade 1",
      "Grade 2"
    ],
    "selectedGradeView": [
      1,
      2
    ],
    "requiredGradeBand": null,
    "parentOfficialCodes": [
      "CG-9",
      "CG-10"
    ],
    "overlapRelation": {
      "kind": "shared-source-goal-not-equivalence",
      "relatedSection": "earlier outcome tables",
      "parentOfficialCodes": [
        "CG-9",
        "CG-10"
      ]
    },
    "ageBand": [
      3,
      8
    ],
    "assessmentProtocols": [
      "form-bound-creative-production"
    ],
    "taskPanel": "creative-selected-form",
    "taskConditions": {
      "actualOwnCreativeWorkAndRevision": true,
      "selectedFormBinding": true,
      "alternativesNotUniversalAND": true
    },
    "topicIds": [],
    "conditionalTopicIds": [
      "mt_2Kn5ianVWN",
      "mt_2mb17lUCPD",
      "mt_hu_OZPduxP",
      "mt_ylFTYS80d1"
    ]
  }
];
const protocolConditions={
  "movement-and-sound-cues": {
    "actualMovement": true,
    "recallPanelModelRemoved": true,
    "noImportedTimedNorm": true,
    "panelBindingRequired": true
  },
  "cleanliness-and-body-needs": {
    "practicalAndReasonedValue": true,
    "noBodyNormOrDiagnosis": true
  },
  "surrounding-shapes-and-properties": {
    "actualSurroundingExamples": true,
    "shapeOrientationVariation": true,
    "noColourPhysicsGate": true
  },
  "visual-material-processes": {
    "exactMaterialMethodPanelRequired": true,
    "ownVisualChoiceAndChange": true,
    "imprintNotPaintedImitation": true,
    "clayActuallyManipulated": true
  },
  "natural-and-chosen-sound-panels": {
    "naturalSourceAttributionRequired": true,
    "bodyPanelActualBodySound": true,
    "instrumentPanelActualInstrument": true,
    "noConstructionDutyInvented": true
  },
  "listening-and-ordered-instructions": {
    "actualHeardContent": true,
    "sourcePanelBinding": true,
    "actualLanguageMaterialBinding": true,
    "noSilenceQuota": true
  },
  "local-nature-recognition": {
    "accurateLocalExamples": true,
    "microhabitatWholeCardCheck": true,
    "noUnknownOrganismHandling": true
  },
  "sound-properties-and-context": {
    "panelsIndependent": [
      "pitch-volume",
      "everyday-noise-context"
    ],
    "noiseRemainsSound": true,
    "publisherDefinitionNotClaimed": true,
    "noLoudExposure": true
  },
  "people-work-and-dignity": {
    "paidAndUnpaidDistinct": true,
    "roleDutyCircumstanceWholeCard": true,
    "noOccupationWorthRanking": true,
    "actualRespectfulAction": true
  },
  "describing-emotions": {
    "noManufacturedUpset": true,
    "tearsNotAutomaticFailure": true,
    "noForcedPrivateDisclosure": true
  },
  "cultural-encounter-and-celebration": {
    "attributionAndMeaningsChecked": true,
    "sourcePanelBinding": true,
    "actualDramaWhereRequired": true,
    "noForcedReligiousOrHomeDisclosure": true
  },
  "collaboration-and-respectful-response": {
    "actualOwnAndOtherIdeas": true,
    "fairCompletedPart": true,
    "differentLegitimateResponses": true,
    "togethernessContextual": true
  },
  "environment-care-and-reuse": {
    "actualProtectiveAction": true,
    "actualMaterialCareOrReuse": true,
    "livingNeedsRetained": true,
    "noUniversalZeroImpactClaim": true
  },
  "form-bound-creative-production": {
    "schoolFormBindingRequired": true,
    "alternativesNotUniversalAND": true,
    "actualOwnWorkAndRevision": true,
    "actualObservationForVisitPanel": true
  },
  "material-origins": {
    "originObjectMaterialDistinction": true,
    "wholeNaturalMadeFibreChecks": true,
    "safeSamplesOrAccurateLabels": true
  },
  "material-inquiry-and-generalisations": {
    "actualObservationAndClassification": true,
    "wholeSortingCountsSeparate": true,
    "newCaseAndCounterexampleForGeneralisation": true,
    "noUnlimitedClaimFromFewSamples": true
  },
  "cross-subject-connections-and-transfer": {
    "actualExplainedConnection": true,
    "actualStrategyTransfer": true,
    "priorKnowledgeNotAssumedFromLabel": true
  },
  "story-making-and-dramatisation": {
    "exactPanelRequired": true,
    "tableauEmbodiedNotDrawing": true,
    "wholeScriptPoemImprovisationSeparate": true,
    "ownStoryDecision": true
  },
  "art-task-organisation": {
    "actualOwnPlanAndResources": true,
    "actualExecutionAndCheck": true,
    "noManufacturedGap": true
  },
  "functional-arts-vocabulary": {
    "actualConversationOrReadAloud": true,
    "ownSpeechAndWriting": true,
    "actualLanguageBinding": true,
    "noFixedNationalLexicon": true
  },
  "contextual-arts-enjoyment": {
    "contextualNotBinaryMastery": true,
    "noForcedLiking": true,
    "sourceStatusUnchanged": true
  }
};
const fields=["key", "disposition", "recordKind", "tableScope", "selectedGradeView", "requiredGradeBand", "parentOfficialCodes", "overlapRelation", "ageBand", "assessmentProtocols", "taskPanel", "taskConditions", "sourceInterpretation"];
const project=x=>({...Object.fromEntries(fields.filter(k=>k in x).map(k=>[k,x[k]])),topicIds:x.contributions.map(c=>c.topicId),conditionalTopicIds:x.conditionalContributions.map(c=>c.topicId)});
const state=()=>({report:read('reports/ncert-arts-syllabus-alignment-2026-11-10.json'),protocols:read('reports/ncert-arts-syllabus-protocols-2026-11-10.json'),ledger:read('reports/ncert-alignment-readiness-2026-11-10.json'),alignments:read('data/curriculum-alignments.json'),topics:read('data/topics.json'),research:read('data/teaching-research.json'),catalogue:read('data/curriculum-standards.json'),manifest:read('data/manifest.json')});
function verify(s){
 const rs=s.report.records,keys=new Set(rs.map(r=>r.key));assert.equal(rs.length,56);assert.equal(keys.size,56);assert.deepEqual(rs.map(project),expected,'reviewed source position/panel/conditions/components drift');
 const ps=new Map(s.protocols.protocols.map(p=>[p.id,p]));assert.equal(ps.size,21);const bs=new Map(s.protocols.sourceBindings.map(b=>[b.key,b]));assert.equal(bs.size,56);
 const known=new Set(s.catalogue.curricula.flatMap(c=>c.topics.map(t=>t.key)));const expectedPairs=new Set();let pairs=0,conditional=0;
 for(const [id,p]of ps){assert.deepEqual(p.sourceConditions,protocolConditions[id]);for(const k of ['task','positiveEvidence','nearMiss','transfer'])assert.equal(typeof p[k],'string');}
 for(const r of rs){
  assert(known.has(r.key));assert.equal(r.recordKind,'syllabusLearningOutcome');assert.equal(r.requiredGradeBand,null);assert.deepEqual(r.tableScope,['Balvatika','Grade 1','Grade 2']);
  const b=bs.get(r.key);assert(b);for(const k of ['assessmentProtocols','taskPanel','taskConditions','tableScope','requiredGradeBand','selectedGradeView','ageBand'])assert.deepEqual(b[k],r[k],k+' source binding');assert.equal(b.sourceInterpretation,r.sourceInterpretation??null);
  for(const id of r.assessmentProtocols){assert(ps.has(id));assert(ps.get(id).sourcePanels.includes(r.taskPanel),'valid family with wrong source panel');}
  const lr=s.ledger.records.find(x=>x.key===r.key);assert.equal(lr?.alignmentReviewStatus,'reviewed-arts-syllabus');assert.equal(lr.disposition,r.disposition);assert.deepEqual(lr.remainingConditions,r.remainingConditions);
  for(const c of r.contributions){assert.equal(c.role,'component');assert.equal(c.topicName,s.topics.topics.find(t=>t.id===c.topicId)?.name);const as=s.alignments.alignments.filter(a=>a.topicId===c.topicId&&a.scope==='jurisdiction'&&a.country==='IN'&&!a.region&&a.ageRangeStart===3&&a.ageRangeEnd===8);assert.equal(as.length,1);assert(as[0].standards.includes(r.key));const k=c.topicId+'|'+r.key;assert(!expectedPairs.has(k));expectedPairs.add(k);pairs++;}
  for(const c of r.conditionalContributions){conditional++;assert(!s.alignments.alignments.some(a=>a.country==='IN'&&a.topicId===c.topicId&&a.standards?.includes(r.key)),'form choice flattened into unconditional link');}
  if(r.disposition==='ConditionalArtFormBinding')assert(r.remainingConditions.length);
  if(r.disposition==='ContextualAffectiveRequirement')assert.equal(r.contributions.length,0);
 }
 const actual=new Set(s.alignments.alignments.flatMap(a=>a.country==='IN'?(a.standards??[]).filter(k=>keys.has(k)).map(k=>a.topicId+'|'+k):[]));assert.deepEqual(actual,expectedPairs);assert.equal(pairs,108);assert.equal(conditional,26);
 const counts={Full:44,SkillWithContextualEngagement:4,ConditionalArtFormBinding:7,ContextualAffectiveRequirement:1};for(const[k,n]of Object.entries(counts)){assert.equal(rs.filter(r=>r.disposition===k).length,n);assert.equal(s.report.counts[k],n);}
 const g=s.research.records.find(g=>g.topicId==='mt_u-Cp7JuK9R');assert(g);assert.equal(g.assess.method,'two_tier');assert.equal(g.confidence,'low');assert(!g.learn.reviewNotes.some(x=>/TLS|truncation|retrieval/.test(x)));
 const reviewed=x=>x.alignmentReviewStatus.startsWith('reviewed');assert.equal(s.ledger.counts.alignmentReviewedHere,s.ledger.records.filter(reviewed).length);assert.equal(s.ledger.counts.notAlignmentReviewedHere,s.ledger.records.filter(r=>!reviewed(r)).length);
 for(const gr of s.ledger.groups){const rows=s.ledger.records.filter(r=>['source','stage','area','recordKind'].every(k=>r[k]===gr[k]));assert.equal(gr.reviewedHere,rows.filter(reviewed).length);assert.equal(gr.pendingHere,rows.filter(r=>!reviewed(r)).length);}
 assert.equal(s.ledger.nextSlices.reduce((n,x)=>n+x.pendingRecords,0),s.ledger.counts.notAlignmentReviewedHere);
 // The new claim must not leave release inventory metadata stale.
 const by={};for(const t of s.topics.topics)by[t.subject]=(by[t.subject]??0)+1;assert.equal(s.topics.topicCount,s.topics.topics.length);assert.equal(s.manifest.counts.topics,s.topics.topics.length);assert.deepEqual(s.manifest.counts.topicsBySubject,by);
 const scale=s.ledger.records.find(r=>r.key==='ncert-fs-2025:IN-NCERT-FS-2025-PM-G2-C9-LO01');assert.equal(scale.disposition,'Unverified','unresolved physical scale phrase silently changed');
}
test('Arts56 binds shared source positions, source-specific panels, conditional choices and components',()=>verify(state()));
test('Arts56 rejects wrong-valid panels, lost physical/material duties, invented grades and implicit form mastery',()=>{
 const ms=[
  s=>s.report.records[0].assessmentProtocols=['functional-arts-vocabulary'],
  s=>s.report.records[0].taskPanel='actual-clay-object',
  s=>s.report.records.find(r=>r.taskPanel==='actual-imprint-texture-product').taskConditions.actualObjectPrintingOrImpression=false,
  s=>s.report.records.find(r=>r.taskPanel==='own-sound-small-instruments').taskConditions.actualSmallInstrumentOutput=false,
  s=>s.report.records.find(r=>r.taskPanel==='dramatic-still-images').taskConditions.actualNonSpeakingEmbodiedTableau=false,
  s=>s.report.records[0].requiredGradeBand=[1],
  s=>s.protocols.sourceBindings[0].tableScope=['Grade 1'],
  s=>{const r=s.report.records.find(r=>r.conditionalContributions.length),c=r.conditionalContributions[0];s.alignments.alignments.push({topicId:c.topicId,scope:'jurisdiction',country:'IN',ageRangeStart:3,ageRangeEnd:8,standards:[r.key]});},
  s=>s.report.records.find(r=>r.sourceInterpretation).sourceInterpretation='Publisher-defined technical noise; all music is wanted.',
  s=>s.manifest.counts.topics--
 ];for(const mutate of ms){const s=state();mutate(s);assert.throws(()=>verify(s));}
});
