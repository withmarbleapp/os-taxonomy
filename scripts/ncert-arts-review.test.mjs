import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = name => JSON.parse(readFileSync(new URL('../'+name, import.meta.url)));
// Independent reviewed source-position registry. A valid protocol for another
// source position is not evidence that this position's conditions were retained.
const expected = [
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G1-C12.1-LO01",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "pressure-and-marks"
    ],
    "taskConditions": {
      "markEffects": [
        "lighter",
        "darker"
      ],
      "actualPressureVariation": true
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G1-C12.1-LO02",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "visual-materials-and-making"
    ],
    "taskConditions": {
      "actualOwnWorkAtDifferentSizes": true,
      "bounds": "available-space-and-materials",
      "notMathematicalScaleRatio": true
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G1-C12.1-LO03",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "collage-and-assemblage"
    ],
    "taskConditions": {
      "actualPanel": "collage",
      "materialVariations": [
        "consistency",
        "colour",
        "texture"
      ],
      "ownArrangement": true
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G1-C12.1-LO04",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "decorative-patterns"
    ],
    "taskConditions": {
      "actualMaterialPattern": true,
      "materialVariations": [
        "shape",
        "texture",
        "colour"
      ],
      "wholeMathRuleChecksSeparate": true
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G1-C12.1-LO05",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "collage-and-assemblage",
      "flat-and-spatial-panels"
    ],
    "taskConditions": {
      "actualPanel": "spatial-assemblage",
      "variedFoundMaterials": true
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G1-C12.2-LO01",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "rhythm-and-variation"
    ],
    "taskConditions": {
      "actualRhythmicPerformance": true,
      "cases": [
        "slow",
        "medium"
      ]
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G1-C12.2-LO02",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "musical-invention"
    ],
    "taskConditions": {
      "actualImprovisedSound": true,
      "channelOpportunities": [
        "voice",
        "body",
        "instrument",
        "object"
      ],
      "familiarSongOrSituation": true
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G1-C12.2-LO03",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "pitch-and-vocal-control"
    ],
    "taskConditions": {
      "actualCase": [
        "pitch",
        "loudness"
      ],
      "bindCompositionSpaceAndContext": true
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G1-C12.2-LO04",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "silence-and-stillness"
    ],
    "taskConditions": {
      "actualTimingContrasts": [
        "sound-silence",
        "movement-stillness"
      ],
      "variedDurations": true,
      "bindSpaceContextSituation": true
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G1-C12.3-LO01",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "imaginative-variation"
    ],
    "taskConditions": {
      "actualMultipleExpressiveApproaches": true,
      "ideaAndEmotionRange": true,
      "sourceIllustrationsNotExhaustive": true
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G1-C12.3-LO02",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "arts-persistence-and-resources"
    ],
    "taskConditions": {
      "genuineManageableChallenge": true,
      "multipleSolutions": true,
      "ownResourceFinding": true,
      "noManufacturedFrustration": true
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G1-C12.3-LO03",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "viewing-and-responding",
      "visual-materials-and-making"
    ],
    "taskConditions": {
      "actualPanels": [
        "creating",
        "viewing"
      ],
      "attendedFeatures": [
        "theme",
        "texture",
        "colour",
        "size",
        "form",
        "space",
        "situation"
      ]
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G1-C12.4-LO01",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "ensemble-and-song-performance"
    ],
    "taskConditions": {
      "actualPartnerOrGroupAlignment": [
        "volume",
        "pitch",
        "tempo"
      ]
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G1-C12.5-LO01",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "viewing-and-responding",
      "local-arts-resources"
    ],
    "taskConditions": {
      "actualComparisonExamples": [
        "artworks",
        "arrangements",
        "cultural-expressions"
      ],
      "ownVariedResponses": true
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G1-C12.5-LO02",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "viewing-and-responding"
    ],
    "taskConditions": {
      "ownResponseShared": true,
      "differentLegitimateResponsesRespected": true,
      "agreementAndPositiveAffectNotRequired": true
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G2-C12.1-LO01",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "pressure-and-marks"
    ],
    "taskConditions": {
      "markEffects": [
        "lighter",
        "darker"
      ],
      "actualPressureVariation": true
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G2-C12.1-LO02",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "visual-materials-and-making"
    ],
    "taskConditions": {
      "actualOwnWorkAtDifferentSizes": true,
      "bounds": "available-space-and-materials",
      "notMathematicalScaleRatio": true
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G2-C12.1-LO03",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "collage-and-assemblage"
    ],
    "taskConditions": {
      "actualPanel": "collage",
      "materialVariations": [
        "consistency",
        "colour",
        "texture"
      ],
      "ownArrangement": true
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G2-C12.1-LO04",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "collage-and-assemblage",
      "flat-and-spatial-panels"
    ],
    "taskConditions": {
      "actualPanel": "spatial-assemblage",
      "variedFoundMaterials": true
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G2-C12.1-LO05",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "texture-making"
    ],
    "taskConditions": {
      "oneDeclaredMaterial": true,
      "actualManipulationProducesVariedTextures": true
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G2-C12.2-LO01",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "rhythm-and-variation"
    ],
    "taskConditions": {
      "actualRhythmicPerformance": true,
      "cases": [
        "song-beat",
        "movement-beat",
        "own-familiar-pattern-variation"
      ]
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G2-C12.2-LO02",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "musical-invention"
    ],
    "taskConditions": {
      "actualImprovisedSound": true,
      "channelOpportunities": [
        "voice",
        "body",
        "instrument",
        "object"
      ],
      "familiarSongOrSituation": true
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G2-C12.2-LO03",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "pitch-and-vocal-control"
    ],
    "taskConditions": {
      "actualHeardReference": true,
      "voiceOrPitchedInstrumentAttempt": true,
      "attemptNotUpgradedToSuccessNorm": true
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G2-C12.2-LO04",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "silence-and-stillness"
    ],
    "taskConditions": {
      "actualTimingContrasts": [
        "sound-silence",
        "movement-stillness"
      ],
      "variedDurations": true,
      "bindSpaceContextSituation": true
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G2-C12.3-LO01",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "imaginative-variation"
    ],
    "taskConditions": {
      "actualMultipleExpressiveApproaches": true,
      "ideaAndEmotionRange": true,
      "sourceIllustrationsNotExhaustive": true
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G2-C12.3-LO02",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "arts-persistence-and-resources"
    ],
    "taskConditions": {
      "genuineManageableChallenge": true,
      "multipleSolutions": true,
      "ownResourceFinding": true,
      "noManufacturedFrustration": true
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G2-C12.3-LO03",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "viewing-and-responding",
      "visual-materials-and-making"
    ],
    "taskConditions": {
      "actualPanels": [
        "creating",
        "viewing"
      ],
      "attendedFeatures": [
        "theme",
        "texture",
        "colour",
        "size",
        "form",
        "space",
        "situation"
      ]
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G2-C12.4-LO01",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "sequenced-cross-form-performance"
    ],
    "taskConditions": {
      "actualSequencePanels": [
        "role-play",
        "music",
        "dance-movement"
      ]
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G2-C12.5-LO01",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "viewing-and-responding",
      "local-arts-resources"
    ],
    "taskConditions": {
      "actualComparisonExamples": [
        "artworks",
        "arrangements",
        "cultural-expressions"
      ],
      "ownVariedResponses": true
    }
  },
  {
    "key": "ncert-fs-2025:IN-NCERT-FS-2025-ART-G2-C12.5-LO02",
    "disposition": "Full",
    "ageBand": [
      6,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": null,
    "assessmentProtocols": [
      "viewing-and-responding"
    ],
    "taskConditions": {
      "ownResponseShared": true,
      "differentLegitimateResponsesRespected": true,
      "agreementAndPositiveAffectNotRequired": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-ART-COMP-C-12.1",
    "disposition": "Full",
    "ageBand": [
      3,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": {
      "attainmentReference": "stage-end",
      "sourceFootnotes": []
    },
    "assessmentProtocols": [
      "visual-materials-and-making",
      "flat-and-spatial-panels"
    ],
    "taskConditions": {
      "actualArtworkPanels": [
        "flat",
        "spatial"
      ],
      "variedMaterialsToolsAndSizes": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-ART-COMP-C-12.2",
    "disposition": "Full",
    "ageBand": [
      3,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": {
      "attainmentReference": "stage-end",
      "sourceFootnotes": []
    },
    "assessmentProtocols": [
      "integrated-performing-exploration"
    ],
    "taskConditions": {
      "actualExploration": [
        "voice",
        "body",
        "space",
        "objects"
      ],
      "actualProduction": [
        "music",
        "role-play",
        "dance-movement"
      ]
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-ART-COMP-C-12.3",
    "disposition": "Full",
    "ageBand": [
      3,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": {
      "attainmentReference": "stage-end",
      "sourceFootnotes": []
    },
    "assessmentProtocols": [
      "imaginative-variation"
    ],
    "taskConditions": {
      "actualOwnImaginativeProduction": true,
      "rangeOfIdeasAndEmotions": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-ART-COMP-C-12.4",
    "disposition": "Full",
    "ageBand": [
      3,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": {
      "attainmentReference": "stage-end",
      "sourceFootnotes": []
    },
    "assessmentProtocols": [
      "collaborative-arts"
    ],
    "taskConditions": {
      "actualCollaborativeArts": true,
      "ownAndOtherIdea": true,
      "fairCompletedPart": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-ART-COMP-C-12.5",
    "disposition": "Full",
    "ageBand": [
      3,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": {
      "attainmentReference": "stage-end",
      "sourceFootnotes": []
    },
    "assessmentProtocols": [
      "viewing-and-responding",
      "local-arts-resources"
    ],
    "taskConditions": {
      "actualMakingAndExperiencing": true,
      "variedFormsAndLocalHeritage": true,
      "ownAndOtherResponses": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-ART-GOAL-CG-12",
    "disposition": "SkillWithContextualEngagement",
    "ageBand": [
      3,
      8
    ],
    "standardSet": null,
    "subArea": null,
    "applicability": {
      "attainmentReference": "stage-end",
      "sourceFootnotes": []
    },
    "assessmentProtocols": [
      "integrated-foundational-arts",
      "visual-materials-and-making",
      "flat-and-spatial-panels",
      "integrated-performing-exploration",
      "imaginative-variation",
      "collaborative-arts",
      "viewing-and-responding",
      "local-arts-resources"
    ],
    "taskConditions": {
      "actualVisualAndPerformingPortfolio": true,
      "meaningfulExpression": true,
      "joyContextualNotMastery": true,
      "childRecordClosure": [
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-ART-COMP-C-12.1",
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-ART-COMP-C-12.2",
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-ART-COMP-C-12.3",
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-ART-COMP-C-12.4",
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-ART-COMP-C-12.5"
      ]
    },
    "includesProtocols": [
      "visual-materials-and-making",
      "flat-and-spatial-panels",
      "integrated-performing-exploration",
      "imaginative-variation",
      "collaborative-arts",
      "viewing-and-responding",
      "local-arts-resources"
    ],
    "includesSourceRecords": [
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-ART-COMP-C-12.1",
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-ART-COMP-C-12.2",
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-ART-COMP-C-12.3",
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-ART-COMP-C-12.4",
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-ART-COMP-C-12.5"
    ]
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-DANCE-MOVEMENT-COMP-C-1.1",
    "disposition": "SkillWithContextualEngagement",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "DANCE-MOVEMENT",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "expressive-movement",
      "curiosity-and-confidence"
    ],
    "taskConditions": {
      "boundArtForm": "DANCE-MOVEMENT",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualCreatePractiseOrPerform": true,
      "enthusiasmSeparateFromPerformance": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-DANCE-MOVEMENT-COMP-C-1.2",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "DANCE-MOVEMENT",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "collaborative-arts",
      "dance-style-comparison"
    ],
    "taskConditions": {
      "boundArtForm": "DANCE-MOVEMENT",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualFormSpecificCollaboration": true,
      "ownThoughtsAndResponsesDuringWork": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-DANCE-MOVEMENT-COMP-C-2.1",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "DANCE-MOVEMENT",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "expressive-movement"
    ],
    "taskConditions": {
      "boundArtForm": "DANCE-MOVEMENT",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualOwnWorkAndPerformance": true,
      "ownSequenceCreatedAndPractised": true,
      "everydayActionOrExperience": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-DANCE-MOVEMENT-COMP-C-2.2",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "DANCE-MOVEMENT",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "dance-style-comparison"
    ],
    "taskConditions": {
      "boundArtForm": "DANCE-MOVEMENT",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualClassroomExamples": true,
      "compareFeaturesNotTasteRanking": true,
      "comparedDimensions": [
        "movement",
        "rhythm",
        "posture",
        "theme",
        "expression"
      ]
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-DANCE-MOVEMENT-COMP-C-3.1",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "DANCE-MOVEMENT",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "artistic-process-choice",
      "expressive-movement"
    ],
    "taskConditions": {
      "boundArtForm": "DANCE-MOVEMENT",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualResourceOrTechniqueChoices": true,
      "actualUse": true,
      "actualChoices": [
        "movement-steps",
        "instruments",
        "costumes",
        "arrangements"
      ]
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-DANCE-MOVEMENT-COMP-C-3.2",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "DANCE-MOVEMENT",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "expressive-movement",
      "artistic-process-choice"
    ],
    "taskConditions": {
      "boundArtForm": "DANCE-MOVEMENT",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualOwnIdeasAndPlanning": true,
      "actualRehearsalOrExecution": true,
      "actualPresentation": true,
      "actualSequenceSelectionAndRehearsalContribution": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-DANCE-MOVEMENT-COMP-C-4.1",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "DANCE-MOVEMENT",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "nature-as-artistic-material",
      "dance-style-comparison"
    ],
    "taskConditions": {
      "boundArtForm": "DANCE-MOVEMENT",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualNaturalFeatureObservation": true,
      "artisticQualitiesDescribed": true,
      "imaginationNotScientificFact": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-DANCE-MOVEMENT-COMP-C-4.2",
    "disposition": "ContextualAffectiveRequirement",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "DANCE-MOVEMENT",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "local-arts-resources",
      "curiosity-and-confidence"
    ],
    "taskConditions": {
      "boundArtForm": "DANCE-MOVEMENT",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualAccurateLocalArtsOpportunity": true,
      "curiosityContextual": true,
      "noBinaryPositiveFeelingScore": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-DANCE-MOVEMENT-GOAL-CG-1",
    "disposition": "SkillWithContextualEngagement",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "DANCE-MOVEMENT",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "form-specific-goals",
      "expressive-movement",
      "curiosity-and-confidence",
      "collaborative-arts",
      "dance-style-comparison"
    ],
    "taskConditions": {
      "boundArtForm": "DANCE-MOVEMENT",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "childRecordClosure": [
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-DANCE-MOVEMENT-COMP-C-1.1",
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-DANCE-MOVEMENT-COMP-C-1.2"
      ],
      "goalNumber": "1",
      "actualGoalPortfolio": true,
      "contextualAffectSeparate": true,
      "humanExperienceThemeActuallyExpressed": true
    },
    "includesProtocols": [
      "expressive-movement",
      "curiosity-and-confidence",
      "collaborative-arts",
      "dance-style-comparison"
    ],
    "includesSourceRecords": [
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-DANCE-MOVEMENT-COMP-C-1.1",
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-DANCE-MOVEMENT-COMP-C-1.2"
    ]
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-DANCE-MOVEMENT-GOAL-CG-2",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "DANCE-MOVEMENT",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "expressive-movement",
      "imaginative-variation",
      "dance-style-comparison"
    ],
    "taskConditions": {
      "boundArtForm": "DANCE-MOVEMENT",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "childRecordClosure": [
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-DANCE-MOVEMENT-COMP-C-2.1",
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-DANCE-MOVEMENT-COMP-C-2.2"
      ],
      "goalNumber": "2",
      "actualGoalPortfolio": true,
      "ownGenerativeWorkBeyondImitation": true
    },
    "includesProtocols": [
      "expressive-movement",
      "dance-style-comparison"
    ],
    "includesSourceRecords": [
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-DANCE-MOVEMENT-COMP-C-2.1",
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-DANCE-MOVEMENT-COMP-C-2.2"
    ]
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-DANCE-MOVEMENT-GOAL-CG-3",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "DANCE-MOVEMENT",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "form-specific-goals",
      "artistic-process-choice",
      "expressive-movement"
    ],
    "taskConditions": {
      "boundArtForm": "DANCE-MOVEMENT",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "childRecordClosure": [
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-DANCE-MOVEMENT-COMP-C-3.1",
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-DANCE-MOVEMENT-COMP-C-3.2"
      ],
      "goalNumber": "3",
      "actualGoalPortfolio": true
    },
    "includesProtocols": [
      "artistic-process-choice",
      "expressive-movement"
    ],
    "includesSourceRecords": [
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-DANCE-MOVEMENT-COMP-C-3.1",
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-DANCE-MOVEMENT-COMP-C-3.2"
    ]
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-DANCE-MOVEMENT-GOAL-CG-4",
    "disposition": "SkillWithContextualEngagement",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "DANCE-MOVEMENT",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "form-specific-goals",
      "nature-as-artistic-material",
      "local-arts-resources",
      "curiosity-and-confidence",
      "dance-style-comparison"
    ],
    "taskConditions": {
      "boundArtForm": "DANCE-MOVEMENT",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "childRecordClosure": [
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-DANCE-MOVEMENT-COMP-C-4.1",
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-DANCE-MOVEMENT-COMP-C-4.2"
      ],
      "goalNumber": "4",
      "actualGoalPortfolio": true,
      "contextualAffectSeparate": true,
      "naturalSurroundingsAndLocalArtsBothEncountered": true
    },
    "includesProtocols": [
      "nature-as-artistic-material",
      "dance-style-comparison",
      "local-arts-resources",
      "curiosity-and-confidence"
    ],
    "includesSourceRecords": [
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-DANCE-MOVEMENT-COMP-C-4.1",
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-DANCE-MOVEMENT-COMP-C-4.2"
    ]
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-MUSIC-COMP-C-1.1",
    "disposition": "SkillWithContextualEngagement",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "MUSIC",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "ensemble-and-song-performance",
      "musical-invention",
      "curiosity-and-confidence"
    ],
    "taskConditions": {
      "boundArtForm": "MUSIC",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualCreatePractiseOrPerform": true,
      "enthusiasmSeparateFromPerformance": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-MUSIC-COMP-C-1.2",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "MUSIC",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "collaborative-arts",
      "music-style-comparison"
    ],
    "taskConditions": {
      "boundArtForm": "MUSIC",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualFormSpecificCollaboration": true,
      "ownThoughtsAndResponsesDuringWork": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-MUSIC-COMP-C-2.1",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "MUSIC",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "ensemble-and-song-performance"
    ],
    "taskConditions": {
      "boundArtForm": "MUSIC",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualOwnWorkAndPerformance": true,
      "actualSongsAndRhythms": true,
      "declaredVariedArrangements": true,
      "vocalPerformanceCannotBeInstrumentProxy": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-MUSIC-COMP-C-2.2",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "MUSIC",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "music-style-comparison"
    ],
    "taskConditions": {
      "boundArtForm": "MUSIC",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualClassroomExamples": true,
      "compareFeaturesNotTasteRanking": true,
      "comparedDimensions": [
        "tempo-Laya",
        "rhythm-Taala",
        "pitch-Sur",
        "expression-Bhaava",
        "lyrics",
        "performance-expression"
      ]
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-MUSIC-COMP-C-3.1",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "MUSIC",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "artistic-process-choice",
      "ensemble-and-song-performance",
      "musical-invention"
    ],
    "taskConditions": {
      "boundArtForm": "MUSIC",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualResourceOrTechniqueChoices": true,
      "actualUse": true,
      "actualChoices": [
        "voices",
        "instruments",
        "arrangements"
      ]
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-MUSIC-COMP-C-3.2",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "MUSIC",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "ensemble-and-song-performance",
      "musical-invention",
      "artistic-process-choice"
    ],
    "taskConditions": {
      "boundArtForm": "MUSIC",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualOwnIdeasAndPlanning": true,
      "actualRehearsalOrExecution": true,
      "actualPresentation": true,
      "actualMusicSelectionAndRehearsalContribution": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-MUSIC-COMP-C-4.1",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "MUSIC",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "nature-as-artistic-material",
      "music-style-comparison"
    ],
    "taskConditions": {
      "boundArtForm": "MUSIC",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualNaturalFeatureObservation": true,
      "artisticQualitiesDescribed": true,
      "imaginationNotScientificFact": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-MUSIC-COMP-C-4.2",
    "disposition": "ContextualAffectiveRequirement",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "MUSIC",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "local-arts-resources",
      "curiosity-and-confidence"
    ],
    "taskConditions": {
      "boundArtForm": "MUSIC",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualAccurateLocalArtsOpportunity": true,
      "curiosityContextual": true,
      "noBinaryPositiveFeelingScore": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-MUSIC-GOAL-CG-1",
    "disposition": "SkillWithContextualEngagement",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "MUSIC",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "form-specific-goals",
      "ensemble-and-song-performance",
      "musical-invention",
      "curiosity-and-confidence",
      "collaborative-arts",
      "music-style-comparison"
    ],
    "taskConditions": {
      "boundArtForm": "MUSIC",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "childRecordClosure": [
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-MUSIC-COMP-C-1.1",
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-MUSIC-COMP-C-1.2"
      ],
      "goalNumber": "1",
      "actualGoalPortfolio": true,
      "contextualAffectSeparate": true,
      "humanExperienceThemeActuallyExpressed": true
    },
    "includesProtocols": [
      "ensemble-and-song-performance",
      "musical-invention",
      "curiosity-and-confidence",
      "collaborative-arts",
      "music-style-comparison"
    ],
    "includesSourceRecords": [
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-MUSIC-COMP-C-1.1",
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-MUSIC-COMP-C-1.2"
    ]
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-MUSIC-GOAL-CG-2",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "MUSIC",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "ensemble-and-song-performance",
      "musical-invention",
      "imaginative-variation",
      "music-style-comparison"
    ],
    "taskConditions": {
      "boundArtForm": "MUSIC",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "childRecordClosure": [
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-MUSIC-COMP-C-2.1",
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-MUSIC-COMP-C-2.2"
      ],
      "goalNumber": "2",
      "actualGoalPortfolio": true,
      "ownGenerativeWorkBeyondImitation": true
    },
    "includesProtocols": [
      "ensemble-and-song-performance",
      "music-style-comparison"
    ],
    "includesSourceRecords": [
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-MUSIC-COMP-C-2.1",
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-MUSIC-COMP-C-2.2"
    ]
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-MUSIC-GOAL-CG-3",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "MUSIC",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "form-specific-goals",
      "artistic-process-choice",
      "ensemble-and-song-performance",
      "musical-invention"
    ],
    "taskConditions": {
      "boundArtForm": "MUSIC",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "childRecordClosure": [
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-MUSIC-COMP-C-3.1",
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-MUSIC-COMP-C-3.2"
      ],
      "goalNumber": "3",
      "actualGoalPortfolio": true
    },
    "includesProtocols": [
      "artistic-process-choice",
      "ensemble-and-song-performance",
      "musical-invention"
    ],
    "includesSourceRecords": [
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-MUSIC-COMP-C-3.1",
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-MUSIC-COMP-C-3.2"
    ]
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-MUSIC-GOAL-CG-4",
    "disposition": "SkillWithContextualEngagement",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "MUSIC",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "form-specific-goals",
      "nature-as-artistic-material",
      "local-arts-resources",
      "curiosity-and-confidence",
      "music-style-comparison"
    ],
    "taskConditions": {
      "boundArtForm": "MUSIC",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "childRecordClosure": [
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-MUSIC-COMP-C-4.1",
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-MUSIC-COMP-C-4.2"
      ],
      "goalNumber": "4",
      "actualGoalPortfolio": true,
      "contextualAffectSeparate": true,
      "naturalSurroundingsAndLocalArtsBothEncountered": true
    },
    "includesProtocols": [
      "nature-as-artistic-material",
      "music-style-comparison",
      "local-arts-resources",
      "curiosity-and-confidence"
    ],
    "includesSourceRecords": [
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-MUSIC-COMP-C-4.1",
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-MUSIC-COMP-C-4.2"
    ]
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-THEATRE-COMP-C-1.1",
    "disposition": "SkillWithContextualEngagement",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "THEATRE",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "complete-theatre-performance",
      "curiosity-and-confidence"
    ],
    "taskConditions": {
      "boundArtForm": "THEATRE",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualCreatePractiseOrPerform": true,
      "enthusiasmSeparateFromPerformance": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-THEATRE-COMP-C-1.2",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "THEATRE",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "collaborative-arts",
      "theatre-style-comparison"
    ],
    "taskConditions": {
      "boundArtForm": "THEATRE",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualFormSpecificCollaboration": true,
      "ownThoughtsAndResponsesDuringWork": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-THEATRE-COMP-C-2.1",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "THEATRE",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "complete-theatre-performance"
    ],
    "taskConditions": {
      "boundArtForm": "THEATRE",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualOwnWorkAndPerformance": true,
      "actualDramaComponents": [
        "characters",
        "roles",
        "situations",
        "spaces",
        "basic-props"
      ]
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-THEATRE-COMP-C-2.2",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "THEATRE",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "theatre-style-comparison"
    ],
    "taskConditions": {
      "boundArtForm": "THEATRE",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualClassroomExamples": true,
      "compareFeaturesNotTasteRanking": true,
      "comparedDimensions": [
        "themes",
        "dramatic-elements",
        "artistic-expression"
      ]
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-THEATRE-COMP-C-3.1",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "THEATRE",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "artistic-process-choice",
      "complete-theatre-performance"
    ],
    "taskConditions": {
      "boundArtForm": "THEATRE",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualResourceOrTechniqueChoices": true,
      "actualUse": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-THEATRE-COMP-C-3.2",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "THEATRE",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "complete-theatre-performance",
      "artistic-process-choice"
    ],
    "taskConditions": {
      "boundArtForm": "THEATRE",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualOwnIdeasAndPlanning": true,
      "actualRehearsalOrExecution": true,
      "actualPresentation": true,
      "actualWorkArrangements": [
        "individual",
        "collaborative"
      ]
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-THEATRE-COMP-C-4.1",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "THEATRE",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "nature-as-artistic-material",
      "theatre-style-comparison"
    ],
    "taskConditions": {
      "boundArtForm": "THEATRE",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualNaturalFeatureObservation": true,
      "artisticQualitiesDescribed": true,
      "imaginationNotScientificFact": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-THEATRE-COMP-C-4.2",
    "disposition": "ContextualAffectiveRequirement",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "THEATRE",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "local-arts-resources",
      "curiosity-and-confidence"
    ],
    "taskConditions": {
      "boundArtForm": "THEATRE",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualAccurateLocalArtsOpportunity": true,
      "curiosityContextual": true,
      "noBinaryPositiveFeelingScore": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-THEATRE-GOAL-CG-1",
    "disposition": "SkillWithContextualEngagement",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "THEATRE",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "form-specific-goals",
      "complete-theatre-performance",
      "curiosity-and-confidence",
      "collaborative-arts",
      "theatre-style-comparison"
    ],
    "taskConditions": {
      "boundArtForm": "THEATRE",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "childRecordClosure": [
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-THEATRE-COMP-C-1.1",
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-THEATRE-COMP-C-1.2"
      ],
      "goalNumber": "1",
      "actualGoalPortfolio": true,
      "contextualAffectSeparate": true,
      "humanExperienceThemeActuallyExpressed": true
    },
    "includesProtocols": [
      "complete-theatre-performance",
      "curiosity-and-confidence",
      "collaborative-arts",
      "theatre-style-comparison"
    ],
    "includesSourceRecords": [
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-THEATRE-COMP-C-1.1",
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-THEATRE-COMP-C-1.2"
    ]
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-THEATRE-GOAL-CG-2",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "THEATRE",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "complete-theatre-performance",
      "imaginative-variation",
      "theatre-style-comparison"
    ],
    "taskConditions": {
      "boundArtForm": "THEATRE",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "childRecordClosure": [
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-THEATRE-COMP-C-2.1",
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-THEATRE-COMP-C-2.2"
      ],
      "goalNumber": "2",
      "actualGoalPortfolio": true,
      "ownGenerativeWorkBeyondImitation": true
    },
    "includesProtocols": [
      "complete-theatre-performance",
      "theatre-style-comparison"
    ],
    "includesSourceRecords": [
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-THEATRE-COMP-C-2.1",
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-THEATRE-COMP-C-2.2"
    ]
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-THEATRE-GOAL-CG-3",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "THEATRE",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "form-specific-goals",
      "artistic-process-choice",
      "complete-theatre-performance"
    ],
    "taskConditions": {
      "boundArtForm": "THEATRE",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "childRecordClosure": [
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-THEATRE-COMP-C-3.1",
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-THEATRE-COMP-C-3.2"
      ],
      "goalNumber": "3",
      "actualGoalPortfolio": true
    },
    "includesProtocols": [
      "artistic-process-choice",
      "complete-theatre-performance"
    ],
    "includesSourceRecords": [
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-THEATRE-COMP-C-3.1",
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-THEATRE-COMP-C-3.2"
    ]
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-THEATRE-GOAL-CG-4",
    "disposition": "SkillWithContextualEngagement",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "THEATRE",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "form-specific-goals",
      "nature-as-artistic-material",
      "local-arts-resources",
      "curiosity-and-confidence",
      "theatre-style-comparison"
    ],
    "taskConditions": {
      "boundArtForm": "THEATRE",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "childRecordClosure": [
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-THEATRE-COMP-C-4.1",
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-THEATRE-COMP-C-4.2"
      ],
      "goalNumber": "4",
      "actualGoalPortfolio": true,
      "contextualAffectSeparate": true,
      "naturalSurroundingsAndLocalArtsBothEncountered": true
    },
    "includesProtocols": [
      "nature-as-artistic-material",
      "theatre-style-comparison",
      "local-arts-resources",
      "curiosity-and-confidence"
    ],
    "includesSourceRecords": [
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-THEATRE-COMP-C-4.1",
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-THEATRE-COMP-C-4.2"
    ]
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-COMP-C-1.1",
    "disposition": "SkillWithContextualEngagement",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "VISUAL",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "visual-materials-and-making",
      "flat-and-spatial-panels",
      "curiosity-and-confidence"
    ],
    "taskConditions": {
      "boundArtForm": "VISUAL",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualCreatePractiseOrPerform": true,
      "enthusiasmSeparateFromPerformance": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-COMP-C-1.2",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "VISUAL",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "collaborative-arts",
      "visual-style-comparison"
    ],
    "taskConditions": {
      "boundArtForm": "VISUAL",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualFormSpecificCollaboration": true,
      "ownThoughtsAndResponsesDuringWork": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-COMP-C-2.1",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "VISUAL",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "visual-materials-and-making",
      "flat-and-spatial-panels"
    ],
    "taskConditions": {
      "boundArtForm": "VISUAL",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualOwnWorkAndPerformance": true,
      "actualCombinedElements": [
        "line",
        "form",
        "colour",
        "space",
        "texture"
      ]
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-COMP-C-2.2",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "VISUAL",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "visual-style-comparison",
      "viewing-and-responding"
    ],
    "taskConditions": {
      "boundArtForm": "VISUAL",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualClassroomExamples": true,
      "compareFeaturesNotTasteRanking": true,
      "comparedDimensions": [
        "visual-elements",
        "themes",
        "expressions"
      ]
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-COMP-C-3.1",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "VISUAL",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "artistic-process-choice",
      "visual-materials-and-making",
      "flat-and-spatial-panels"
    ],
    "taskConditions": {
      "boundArtForm": "VISUAL",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualResourceOrTechniqueChoices": true,
      "actualUse": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-COMP-C-3.2",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "VISUAL",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "visual-materials-and-making",
      "flat-and-spatial-panels",
      "artistic-process-choice"
    ],
    "taskConditions": {
      "boundArtForm": "VISUAL",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualOwnIdeasAndPlanning": true,
      "actualRehearsalOrExecution": true,
      "actualPresentation": true,
      "actualWorkArrangements": [
        "individual",
        "collaborative"
      ]
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-COMP-C-4.1",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "VISUAL",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "nature-as-artistic-material",
      "visual-style-comparison"
    ],
    "taskConditions": {
      "boundArtForm": "VISUAL",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualNaturalFeatureObservation": true,
      "artisticQualitiesDescribed": true,
      "imaginationNotScientificFact": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-COMP-C-4.2",
    "disposition": "ContextualAffectiveRequirement",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "VISUAL",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "local-arts-resources",
      "curiosity-and-confidence"
    ],
    "taskConditions": {
      "boundArtForm": "VISUAL",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "actualAccurateLocalArtsOpportunity": true,
      "curiosityContextual": true,
      "noBinaryPositiveFeelingScore": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-GOAL-CG-1",
    "disposition": "SkillWithContextualEngagement",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "VISUAL",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "form-specific-goals",
      "visual-materials-and-making",
      "flat-and-spatial-panels",
      "curiosity-and-confidence",
      "collaborative-arts",
      "visual-style-comparison"
    ],
    "taskConditions": {
      "boundArtForm": "VISUAL",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "childRecordClosure": [
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-COMP-C-1.1",
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-COMP-C-1.2"
      ],
      "goalNumber": "1",
      "actualGoalPortfolio": true,
      "contextualAffectSeparate": true,
      "humanExperienceThemeActuallyExpressed": true
    },
    "includesProtocols": [
      "visual-materials-and-making",
      "flat-and-spatial-panels",
      "curiosity-and-confidence",
      "collaborative-arts",
      "visual-style-comparison"
    ],
    "includesSourceRecords": [
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-COMP-C-1.1",
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-COMP-C-1.2"
    ]
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-GOAL-CG-2",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "VISUAL",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "visual-materials-and-making",
      "flat-and-spatial-panels",
      "imaginative-variation",
      "visual-style-comparison",
      "viewing-and-responding"
    ],
    "taskConditions": {
      "boundArtForm": "VISUAL",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "childRecordClosure": [
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-COMP-C-2.1",
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-COMP-C-2.2"
      ],
      "goalNumber": "2",
      "actualGoalPortfolio": true,
      "ownGenerativeWorkBeyondImitation": true
    },
    "includesProtocols": [
      "visual-materials-and-making",
      "flat-and-spatial-panels",
      "visual-style-comparison",
      "viewing-and-responding"
    ],
    "includesSourceRecords": [
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-COMP-C-2.1",
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-COMP-C-2.2"
    ]
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-GOAL-CG-3",
    "disposition": "Full",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "VISUAL",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "form-specific-goals",
      "artistic-process-choice",
      "visual-materials-and-making",
      "flat-and-spatial-panels"
    ],
    "taskConditions": {
      "boundArtForm": "VISUAL",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "childRecordClosure": [
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-COMP-C-3.1",
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-COMP-C-3.2"
      ],
      "goalNumber": "3",
      "actualGoalPortfolio": true
    },
    "includesProtocols": [
      "artistic-process-choice",
      "visual-materials-and-making",
      "flat-and-spatial-panels"
    ],
    "includesSourceRecords": [
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-COMP-C-3.1",
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-COMP-C-3.2"
    ]
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-GOAL-CG-4",
    "disposition": "SkillWithContextualEngagement",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS1",
    "subArea": "VISUAL",
    "applicability": {
      "resourceCondition": "full-set-on-provision-of-required-resources",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "form-specific-goals",
      "nature-as-artistic-material",
      "local-arts-resources",
      "curiosity-and-confidence",
      "visual-style-comparison"
    ],
    "taskConditions": {
      "boundArtForm": "VISUAL",
      "LS1ResourcesProvided": true,
      "schoolAppropriateAccessibleContextualChoice": true,
      "childRecordClosure": [
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-COMP-C-4.1",
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-COMP-C-4.2"
      ],
      "goalNumber": "4",
      "actualGoalPortfolio": true,
      "contextualAffectSeparate": true,
      "naturalSurroundingsAndLocalArtsBothEncountered": true
    },
    "includesProtocols": [
      "nature-as-artistic-material",
      "visual-style-comparison",
      "local-arts-resources",
      "curiosity-and-confidence"
    ],
    "includesSourceRecords": [
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-COMP-C-4.1",
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS1-VISUAL-COMP-C-4.2"
    ]
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS2-INTEGRATED-COMP-C-1.1",
    "disposition": "ConditionalArtFormBinding",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS2",
    "subArea": "INTEGRATED",
    "applicability": {
      "resourceCondition": "baseline-from-start-of-implementation",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "integrated-baseline-arts"
    ],
    "taskConditions": {
      "schoolSelectedArtFormsRequired": true,
      "accessibleContextualResourceBinding": true,
      "alternativeFormsNotUniversalAND": true,
      "LS2BaselineNotDifficultyLevel": true,
      "actualOwnVariedCreationAndPresentation": true,
      "communicatedIdeasAndEmotions": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS2-INTEGRATED-COMP-C-1.2",
    "disposition": "ConditionalArtFormBinding",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS2",
    "subArea": "INTEGRATED",
    "applicability": {
      "resourceCondition": "baseline-from-start-of-implementation",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "integrated-baseline-arts",
      "artistic-process-choice"
    ],
    "taskConditions": {
      "schoolSelectedArtFormsRequired": true,
      "accessibleContextualResourceBinding": true,
      "alternativeFormsNotUniversalAND": true,
      "LS2BaselineNotDifficultyLevel": true,
      "variedMaterialsToolsProcessesDescribed": true,
      "actualFamiliarityInOwnWork": true,
      "printedInstrumentsAndBeatCasesIllustrativeNotUniversal": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS2-INTEGRATED-COMP-C-1.3",
    "disposition": "ConditionalArtFormBinding",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS2",
    "subArea": "INTEGRATED",
    "applicability": {
      "resourceCondition": "baseline-from-start-of-implementation",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "integrated-baseline-arts",
      "collaborative-arts",
      "viewing-and-responding"
    ],
    "taskConditions": {
      "schoolSelectedArtFormsRequired": true,
      "accessibleContextualResourceBinding": true,
      "alternativeFormsNotUniversalAND": true,
      "LS2BaselineNotDifficultyLevel": true,
      "actualCollaborativeArtwork": true,
      "ownThoughtsAndFeelingsShared": true,
      "actualSurroundingArtsCultureResponse": true
    }
  },
  {
    "key": "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS2-INTEGRATED-GOAL-CG-1",
    "disposition": "ConditionalArtFormBinding",
    "ageBand": [
      8,
      11
    ],
    "standardSet": "LS2",
    "subArea": "INTEGRATED",
    "applicability": {
      "resourceCondition": "baseline-from-start-of-implementation",
      "artsChoice": "school-selected-appropriate-accessible-contextual-artforms"
    },
    "assessmentProtocols": [
      "integrated-baseline-arts",
      "curiosity-and-confidence",
      "artistic-process-choice",
      "collaborative-arts",
      "viewing-and-responding"
    ],
    "taskConditions": {
      "schoolSelectedArtFormsRequired": true,
      "accessibleContextualResourceBinding": true,
      "alternativeFormsNotUniversalAND": true,
      "LS2BaselineNotDifficultyLevel": true,
      "childRecordClosure": [
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS2-INTEGRATED-COMP-C-1.1",
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS2-INTEGRATED-COMP-C-1.2",
        "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS2-INTEGRATED-COMP-C-1.3"
      ],
      "actualImaginativeCreativePortfolio": true,
      "enjoymentSeparateContextualChannel": true
    },
    "includesProtocols": [
      "integrated-baseline-arts",
      "artistic-process-choice",
      "collaborative-arts",
      "viewing-and-responding"
    ],
    "includesSourceRecords": [
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS2-INTEGRATED-COMP-C-1.1",
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS2-INTEGRATED-COMP-C-1.2",
      "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-PREP-ART-LS2-INTEGRATED-COMP-C-1.3"
    ]
  }
];
const protocolConditions = {
  "pressure-and-marks": {
    "actualPressureVariation": true,
    "noFixedGripOrHand": true
  },
  "visual-materials-and-making": {
    "ownArtworkAndRevision": true,
    "materialAndWorkingAreaVariation": true
  },
  "flat-and-spatial-panels": {
    "requiredPanels": [
      "flat",
      "spatial"
    ],
    "actualConstruction": true
  },
  "collage-and-assemblage": {
    "sourcePanelBinding": [
      "collage",
      "spatial-assemblage"
    ],
    "variedMaterialProperties": true
  },
  "decorative-patterns": {
    "actualMaterialArrangement": true,
    "wholeMathPatternChecksSeparate": true
  },
  "texture-making": {
    "oneMaterialManipulated": true,
    "actualTextureProduction": true
  },
  "integrated-performing-exploration": {
    "requiredPanels": [
      "voice-music",
      "dramatic-role-play",
      "dance-movement"
    ],
    "noInstrumentalOnlyProxy": true
  },
  "musical-invention": {
    "availableChannelOpportunities": [
      "voice",
      "body",
      "instrument",
      "everyday-object"
    ],
    "actualSoundAndRevision": true
  },
  "rhythm-and-variation": {
    "actualBeatAndRepeatedSound": true,
    "sourceTempoCasesRetained": true
  },
  "pitch-and-vocal-control": {
    "actualReferenceAndProduction": true,
    "vocalCaseRequires": [
      "pitch",
      "loudness"
    ],
    "attemptNotProfessionalAccuracyNorm": true
  },
  "silence-and-stillness": {
    "contrasts": [
      "sound-silence",
      "movement-stillness"
    ],
    "noBehaviourQuota": true
  },
  "imaginative-variation": {
    "actualAlternativeApproaches": true,
    "noForcedPersonalDisclosure": true
  },
  "arts-persistence-and-resources": {
    "genuineChallengeOnly": true,
    "noManufacturedFrustration": true,
    "actualResourceSelection": true
  },
  "viewing-and-responding": {
    "ownResponseWithReason": true,
    "differentLegitimateResponse": true,
    "makingAndViewingWhereRequired": true
  },
  "local-arts-resources": {
    "actualAttributedLocalExample": true,
    "voluntaryInterestChannel": true,
    "noCompulsoryLiking": true
  },
  "collaborative-arts": {
    "actualArtisticSharedWork": true,
    "ownAndOtherIdeas": true,
    "fairCompletedPart": true
  },
  "ensemble-and-song-performance": {
    "actualSingingAndRhythm": true,
    "variedArrangements": true,
    "partnerAlignmentDimensions": [
      "volume",
      "pitch",
      "tempo"
    ]
  },
  "sequenced-cross-form-performance": {
    "requiredPanels": [
      "role-play",
      "music",
      "dance-movement"
    ],
    "actualSequencePerformance": true
  },
  "expressive-movement": {
    "ownSequencePracticePerformance": true,
    "purposefulVisibleContrast": true,
    "accessibleMovementOptions": true
  },
  "complete-theatre-performance": {
    "wholeExistingClaimPanels": [
      "script",
      "poem",
      "improvisation"
    ],
    "voiceActionSilenceStillness": true,
    "noIndependentReadingGate": true
  },
  "music-style-comparison": {
    "dimensions": [
      "Laya-tempo",
      "Taala-rhythm",
      "Sur-pitch",
      "Bhaava-expression",
      "lyrics",
      "performed-expression"
    ],
    "styleSpecificResourcesRequired": true
  },
  "dance-style-comparison": {
    "dimensions": [
      "movement",
      "rhythm",
      "posture",
      "theme",
      "expression"
    ],
    "attributionChecked": true
  },
  "theatre-style-comparison": {
    "actualClassroomProductions": true,
    "themeAndDramaticElements": true
  },
  "visual-style-comparison": {
    "actualArtworks": true,
    "visualElementsAndTheme": true
  },
  "artistic-process-choice": {
    "formAndResourceBindingRequired": true,
    "actualUseNotNamesOnly": true,
    "planMakeReviewPresent": true
  },
  "nature-as-artistic-material": {
    "actualObservationOrAccurateRecord": true,
    "observationSeparateFromImagination": true
  },
  "curiosity-and-confidence": {
    "nonBinaryContextualChannel": true,
    "noForcedPositiveFeeling": true
  },
  "integrated-foundational-arts": {
    "requiredCompetencies": [
      "C-12.1",
      "C-12.2",
      "C-12.3",
      "C-12.4",
      "C-12.5"
    ],
    "stageEndNotAgeThreeDeadline": true
  },
  "form-specific-goals": {
    "exactFormAndGoalBinding": true,
    "childProtocolClosure": true,
    "LS1ResourcesRequired": true
  },
  "integrated-baseline-arts": {
    "schoolArtFormBindingRequired": true,
    "alternativesNotUniversalAND": true,
    "LS2BaselineNotDifficultyLevel": true
  }
};
const fields = ['key','disposition','ageBand','standardSet','subArea','applicability','assessmentProtocols','taskConditions','includesProtocols','includesSourceRecords'];
const project = row => Object.fromEntries(fields.filter(k=>k in row).map(k=>[k,row[k]]));
const state = () => ({report:read('reports/ncert-arts-alignment-2026-11-10.json'), protocols:read('reports/ncert-arts-protocols-2026-11-10.json'), ledger:read('reports/ncert-alignment-readiness-2026-11-10.json'), alignments:read('data/curriculum-alignments.json'), topics:read('data/topics.json'), research:read('data/teaching-research.json'), catalogue:read('data/curriculum-standards.json')});
function verify(s) {
 const rows=s.report.records, keys=new Set(rows.map(r=>r.key));
 assert.equal(keys.size,88);assert.equal(rows.length,88);
 assert.deepEqual(rows.map(project),expected,'reviewed position, protocol and source-condition binding changed');
 const protocols=new Map(s.protocols.protocols.map(p=>[p.id,p]));assert.equal(protocols.size,30);
 for(const [id,p] of protocols){assert.deepEqual(p.sourceConditions,protocolConditions[id],'protocol source duties changed');for(const field of ['task','positiveEvidence','nearMiss','transfer'])assert.equal(typeof p[field],'string');}
 const bindings=new Map(s.protocols.sourceBindings.map(r=>[r.key,r]));assert.equal(bindings.size,88);
 const byKey=new Map(rows.map(r=>[r.key,r]));
 const actualKeys=new Set(s.catalogue.curricula.flatMap(c=>c.topics.map(t=>t.key)));
 const pairSet=new Set();let pairs=0,conditional=0;
 for(const row of rows){
  assert(actualKeys.has(row.key),'source key not catalogued');
  const b=bindings.get(row.key);assert(b,'missing source binding');
  for(const k of ['assessmentProtocols','taskConditions','ageBand','standardSet','subArea','applicability'])assert.deepEqual(b[k],row[k],k+' binding drift');
  assert.deepEqual(b.includesProtocols,row.includesProtocols??[]);assert.deepEqual(b.includesSourceRecords,row.includesSourceRecords??[]);
  for(const id of row.assessmentProtocols)assert(protocols.has(id),'unknown task protocol');
  for(const key of row.includesSourceRecords??[]){const child=byKey.get(key);assert(child,'missing goal child');for(const id of child.assessmentProtocols)assert(row.includesProtocols.includes(id),'goal lost child task');}
  const ledger=s.ledger.records.find(r=>r.key===row.key);assert.equal(ledger?.alignmentReviewStatus,'reviewed-arts');assert.equal(ledger.disposition,row.disposition);assert.deepEqual(ledger.remainingConditions,row.remainingConditions);
  for(const c of row.contributions){
   assert.equal(c.role,'component');assert.equal(c.topicName,s.topics.topics.find(t=>t.id===c.topicId)?.name);
   const contexts=s.alignments.alignments.filter(a=>a.topicId===c.topicId&&a.scope==='jurisdiction'&&a.country==='IN'&&!a.region&&a.ageRangeStart===row.ageBand[0]&&a.ageRangeEnd===row.ageBand[1]);
   assert.equal(contexts.length,1);assert(contexts[0].standards.includes(row.key),'missing exact-band component association');
   const pk=c.topicId+'|'+row.key;assert(!pairSet.has(pk),'duplicate component pair');pairSet.add(pk);pairs++;
  }
  for(const c of row.conditionalContributions??[]){
   conditional++;assert(!s.alignments.alignments.some(a=>a.topicId===c.topicId&&a.country==='IN'&&a.standards?.includes(row.key)),'conditional art-form candidate became an unconditional link');
  }
  if(row.disposition==='ConditionalArtFormBinding'){assert(row.remainingConditions.length);assert(row.taskConditions.schoolSelectedArtFormsRequired);assert(row.taskConditions.alternativeFormsNotUniversalAND);}
  if(row.disposition==='ContextualAffectiveRequirement')assert.equal(row.contributions.length,0);
 }
 const actualPairs=new Set(s.alignments.alignments.flatMap(a=>a.country==='IN'?(a.standards??[]).filter(k=>keys.has(k)).map(k=>a.topicId+'|'+k):[]));assert.deepEqual(actualPairs,pairSet,'undeclared Arts component association');
 assert.equal(pairs,249);assert.equal(conditional,12);
 const expectedCounts={Full:67,SkillWithContextualEngagement:13,ContextualAffectiveRequirement:4,ConditionalArtFormBinding:4};for(const [k,n]of Object.entries(expectedCounts))assert.equal(rows.filter(r=>r.disposition===k).length,n);
 for(const item of s.report.newClaims){
  const t=s.topics.topics.find(t=>t.id===item.topicId),g=s.research.records.find(r=>r.topicId===item.topicId);assert(t&&g);assert.equal(t.name,item.name);assert.equal(g.assess.method,'performance_task');assert(g.assess.responseLevels.full);assert.equal(g.confidence,'low');
 }
 const reviewed=r=>r.alignmentReviewStatus.startsWith('reviewed');assert.equal(s.ledger.counts.alignmentReviewedHere,s.ledger.records.filter(reviewed).length);assert.equal(s.ledger.counts.notAlignmentReviewedHere,s.ledger.records.filter(r=>!reviewed(r)).length);
 for(const group of s.ledger.groups){const rs=s.ledger.records.filter(r=>['source','stage','area','recordKind'].every(k=>r[k]===group[k]));assert.equal(group.reviewedHere,rs.filter(reviewed).length);assert.equal(group.pendingHere,rs.filter(r=>!reviewed(r)).length);}
 assert.equal(s.ledger.nextSlices.reduce((n,x)=>n+x.pendingRecords,0),s.ledger.counts.notAlignmentReviewedHere);
}
test('Arts88 source duties, choices, protocol closure and scoped components stay consistent',()=>verify(state()));
test('Arts88 rejects valid-but-wrong protocols, lost duties, goal holes and flattened alternatives',()=>{
 const mutations=[
  s=>s.report.records[0].assessmentProtocols=['rhythm-and-variation'],
  s=>s.report.records.find(r=>r.taskConditions.oneDeclaredMaterial).taskConditions.oneDeclaredMaterial=false,
  s=>s.report.records.find(r=>r.taskConditions.actualPartnerOrGroupAlignment).taskConditions.actualPartnerOrGroupAlignment=['tempo'],
  s=>s.report.records.find(r=>r.taskConditions.actualSongsAndRhythms).taskConditions.actualSongsAndRhythms=false,
  s=>s.report.records.find(r=>r.includesProtocols?.length).includesProtocols.pop(),
  s=>{const r=s.report.records.find(r=>r.conditionalContributions?.length);const c=r.conditionalContributions[0];s.alignments.alignments.push({topicId:c.topicId,scope:'jurisdiction',country:'IN',ageRangeStart:8,ageRangeEnd:11,standards:[r.key]});},
  s=>s.protocols.sourceBindings[0].taskConditions={},
  s=>s.protocols.protocols.find(p=>p.id==='ensemble-and-song-performance').sourceConditions.actualSingingAndRhythm=false,
  s=>s.ledger.records.find(r=>r.key===s.report.records[0].key).disposition='Unverified'
 ];for(const mutate of mutations){const s=state();mutate(s);assert.throws(()=>verify(s),'reviewed source-duty mutation must fail');}
});
