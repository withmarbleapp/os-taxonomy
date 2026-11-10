import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
const load = name => JSON.parse(readFileSync(new URL('../' + name, import.meta.url)));
const clone = x => structuredClone(x);
const expected = {
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-SE-COMP-C-4.1": {
    "topics": [
      "mt_nHvYYrhoM7"
    ],
    "protocols": [
      "self-belonging"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "stage-end",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-SE-COMP-C-4.2": {
    "topics": [
      "mt_LhkP_KKIRS",
      "mt_Iwg2diBSyW",
      "mt_TU3BcLOgiV"
    ],
    "protocols": [
      "emotion-expression",
      "regulation"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "stage-end",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-SE-COMP-C-4.3": {
    "topics": [
      "mt_YbX3LD0Eca",
      "mt_PdYlsA33jB",
      "mt_QxsoqVUt6u"
    ],
    "protocols": [
      "peer-initiative",
      "mutual-help"
    ],
    "disposition": "SkillWithContextualEngagement",
    "conditions": {
      "attainmentReference": "stage-end",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-SE-COMP-C-4.4": {
    "topics": [
      "mt_FwI7q7DSIx",
      "mt_QxsoqVUt6u"
    ],
    "protocols": [
      "joint-play-work"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "stage-end",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-SE-COMP-C-4.5": {
    "topics": [
      "mt_rkrG2w7WXI",
      "mt_IiWjd0377Z"
    ],
    "protocols": [
      "rules-with-agency"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "stage-end",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-SE-COMP-C-4.6": {
    "topics": [
      "mt_lAvS72LOUO",
      "mt_L1469gt34A",
      "mt_LTb0ZReMR2"
    ],
    "protocols": [
      "kindness-care",
      "living-care"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "stage-end",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-SE-COMP-C-4.7": {
    "topics": [
      "mt_wzUzVEBqJb",
      "mt_OJVkWvIaM_",
      "mt_YbX3LD0Eca"
    ],
    "protocols": [
      "respectful-differences"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "stage-end",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-SE-COMP-C-5.1": {
    "topics": [
      "mt_FtCLISvSGw",
      "mt_EWiY8-opdd",
      "mt_F62VTeHB4-",
      "mt_QxsoqVUt6u"
    ],
    "protocols": [
      "productive-service"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "stage-end",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-SE-COMP-C-6.1": {
    "topics": [
      "mt_L1469gt34A",
      "mt_LTb0ZReMR2",
      "mt_ppENoD8vf1",
      "mt_0B64gfJf7j"
    ],
    "protocols": [
      "living-care",
      "nature-observation"
    ],
    "disposition": "SkillWithContextualEngagement",
    "conditions": {
      "attainmentReference": "stage-end",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-SE-GOAL-CG-4": {
    "topics": [
      "mt_nHvYYrhoM7",
      "mt_LhkP_KKIRS",
      "mt_Iwg2diBSyW",
      "mt_TU3BcLOgiV",
      "mt_YbX3LD0Eca",
      "mt_PdYlsA33jB",
      "mt_QxsoqVUt6u",
      "mt_FwI7q7DSIx",
      "mt_rkrG2w7WXI",
      "mt_IiWjd0377Z",
      "mt_lAvS72LOUO",
      "mt_L1469gt34A",
      "mt_LTb0ZReMR2",
      "mt_wzUzVEBqJb",
      "mt_OJVkWvIaM_"
    ],
    "protocols": [
      "integrated-social-emotional"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "stage-end",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-SE-GOAL-CG-5": {
    "topics": [
      "mt_FtCLISvSGw",
      "mt_EWiY8-opdd",
      "mt_F62VTeHB4-",
      "mt_QxsoqVUt6u"
    ],
    "protocols": [
      "productive-service"
    ],
    "disposition": "SkillWithContextualEngagement",
    "conditions": {
      "attainmentReference": "stage-end",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-ncfse-2023-ed2024:IN-NCERT-NCFSE-2023-ED2024-FOUNDATION-SE-GOAL-CG-6": {
    "topics": [
      "mt_L1469gt34A",
      "mt_LTb0ZReMR2",
      "mt_ppENoD8vf1",
      "mt_0B64gfJf7j"
    ],
    "protocols": [
      "living-care",
      "nature-observation"
    ],
    "disposition": "SkillWithContextualEngagement",
    "conditions": {
      "attainmentReference": "stage-end",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G1-C4.4-LO01": {
    "topics": [
      "mt_k-UuT5CUZ4",
      "mt_FwI7q7DSIx"
    ],
    "protocols": [
      "movement-play"
    ],
    "disposition": "SkillWithContextualEngagement",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G1-C4.4-LO02": {
    "topics": [
      "mt_r-BgS-lqTe",
      "mt_rkrG2w7WXI"
    ],
    "protocols": [
      "instructions-and-rules"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false,
      "instructionRange": [
        3,
        4
      ],
      "deliveredTogetherNotOneAtATime": true
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G1-C4.5-LO01": {
    "topics": [
      "mt_QR3vxbN1o4",
      "mt_QxsoqVUt6u"
    ],
    "protocols": [
      "peer-initiative",
      "joint-play-work"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G1-C4.5-LO02": {
    "topics": [
      "mt_QxsoqVUt6u",
      "mt_FwI7q7DSIx"
    ],
    "protocols": [
      "joint-play-work"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G1-C4.6-LO01": {
    "topics": [
      "mt_lAvS72LOUO",
      "mt_L1469gt34A",
      "mt_LTb0ZReMR2"
    ],
    "protocols": [
      "kindness-care",
      "living-care"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G1-C5.1-LO01": {
    "topics": [
      "mt_0B64gfJf7j",
      "mt_L1469gt34A"
    ],
    "protocols": [
      "tree-seedling"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false,
      "actualLocalTreeSeedGermination": true,
      "actualSeedlingCare": true,
      "beanOnlySubstitution": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G1-C6.1-LO01": {
    "topics": [
      "mt_ppENoD8vf1"
    ],
    "protocols": [
      "nature-observation"
    ],
    "disposition": "SkillWithContextualEngagement",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G1-C6.1-LO02": {
    "topics": [
      "mt_0B64gfJf7j",
      "mt_L1469gt34A"
    ],
    "protocols": [
      "living-care",
      "tree-seedling"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false,
      "recurringActualPlantCare": true
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G1-G2-C4.1-LO01": {
    "topics": [
      "mt_nHvYYrhoM7",
      "mt_lAvS72LOUO"
    ],
    "protocols": [
      "self-belonging",
      "kindness-care"
    ],
    "disposition": "SkillWithContextualEngagement",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G1-G2-C4.2-LO01": {
    "topics": [
      "mt_kvrvpQris4"
    ],
    "protocols": [
      "emotion-expression"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G1-G2-C4.2-LO02": {
    "topics": [
      "mt_9V8Z386RDx"
    ],
    "protocols": [
      "emotion-through-play-art"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false,
      "actualPlayAndArtExpression": true
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G1-G2-C4.2-LO03": {
    "topics": [
      "mt_kvrvpQris4"
    ],
    "protocols": [
      "emotion-expression"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false,
      "voluntaryOwnFeelingCommunication": true
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G1-G2-C4.2-LO04": {
    "topics": [
      "mt_ggcamLzXAy",
      "mt_Iwg2diBSyW",
      "mt_j8Pv3s7TZR"
    ],
    "protocols": [
      "regulation"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G1-G2-C4.2-LO05": {
    "topics": [
      "mt_kvrvpQris4"
    ],
    "protocols": [
      "emotion-expression"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G1-G2-C4.3-LO01": {
    "topics": [
      "mt_QxsoqVUt6u",
      "mt_YbX3LD0Eca"
    ],
    "protocols": [
      "peer-initiative"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false,
      "childInitiatedPeerExchangeDifferentContexts": true
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G1-G2-C4.3-LO02": {
    "topics": [
      "mt_QxsoqVUt6u",
      "mt_QR3vxbN1o4"
    ],
    "protocols": [
      "peer-initiative",
      "joint-play-work"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false,
      "inventedActivityForAtLeastTwoChildren": true
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G1-G2-C4.3-LO03": {
    "topics": [
      "mt_PdYlsA33jB",
      "mt_lAvS72LOUO"
    ],
    "protocols": [
      "mutual-help"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false,
      "askingAndProvidingActualHelp": true
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G1-G2-C4.3-LO04": {
    "topics": [
      "mt_QxsoqVUt6u",
      "mt_FwI7q7DSIx"
    ],
    "protocols": [
      "joint-play-work"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G1-G2-C4.3-LO05": {
    "topics": [
      "mt_HBcvu0UxYe"
    ],
    "protocols": [
      "friend-identity"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G1-G2-C4.7-LO01": {
    "topics": [
      "mt_OJVkWvIaM_",
      "mt_f8n4txtLej"
    ],
    "protocols": [
      "respectful-differences"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false,
      "learnerFormulatedInformationQuestion": true,
      "forcedPrivateDisclosure": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G1-G2-C4.7-LO02": {
    "topics": [
      "mt_OJVkWvIaM_",
      "mt_nHvYYrhoM7"
    ],
    "protocols": [
      "respectful-differences"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G1-G2-C4.7-LO03": {
    "topics": [
      "mt_OJVkWvIaM_",
      "mt_wzUzVEBqJb"
    ],
    "protocols": [
      "respectful-differences"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G1-G2-C4.7-LO04": {
    "topics": [
      "mt_OJVkWvIaM_"
    ],
    "protocols": [
      "respectful-differences"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false,
      "verifiedDifferentLanguageLabelsSameReferent": true
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G1-G2-C4.7-LO05": {
    "topics": [
      "mt_PJE57bAvMG"
    ],
    "protocols": [
      "roles-across-settings"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false,
      "samePersonDifferentRoles": true,
      "wholeRoleDutyCircumstanceTransferSeparate": true
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G2-C4.4-LO01": {
    "topics": [
      "mt_OTFABm2xdf",
      "mt_FwI7q7DSIx"
    ],
    "protocols": [
      "movement-play"
    ],
    "disposition": "SkillWithContextualEngagement",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G2-C4.4-LO02": {
    "topics": [
      "mt_r-BgS-lqTe",
      "mt_rkrG2w7WXI",
      "mt_IiWjd0377Z"
    ],
    "protocols": [
      "instructions-and-rules",
      "rules-with-agency"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false,
      "actualComplexSequenceAndOwnRule": true
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G2-C4.4-LO03": {
    "topics": [
      "mt_HoJGVsMO7H",
      "mt_S4G6GLKr1-"
    ],
    "protocols": [
      "attention-and-persistence"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false,
      "comparableAttentionAndActualPersistence": true,
      "universalDurationAdded": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G2-C4.5-LO01": {
    "topics": [
      "mt_QxsoqVUt6u"
    ],
    "protocols": [
      "joint-play-work"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G2-C4.5-LO02": {
    "topics": [
      "mt_QR3vxbN1o4"
    ],
    "protocols": [
      "productive-service"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G2-C4.6-LO01": {
    "topics": [
      "mt_lAvS72LOUO",
      "mt_QxsoqVUt6u",
      "mt_FwI7q7DSIx"
    ],
    "protocols": [
      "kindness-care",
      "joint-play-work"
    ],
    "disposition": "SkillWithContextualEngagement",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G2-C5.1-LO01": {
    "topics": [
      "mt_FtCLISvSGw",
      "mt_QxsoqVUt6u"
    ],
    "protocols": [
      "productive-service"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false,
      "functionalTeachingMaterialCreatedAndUsed": true
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G2-C5.1-LO02": {
    "topics": [
      "mt_EWiY8-opdd",
      "mt_F62VTeHB4-"
    ],
    "protocols": [
      "productive-service"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false,
      "actualKitchenCleaningAndCutting": true
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G2-C6.1-LO01": {
    "topics": [
      "mt_L1469gt34A",
      "mt_LTb0ZReMR2"
    ],
    "protocols": [
      "living-care"
    ],
    "disposition": "Full",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false,
      "recurringActualAnimalCare": true,
      "briefMinibeastObservationAloneSufficient": false
    }
  },
  "ncert-fs-2025:IN-NCERT-FS-2025-SE-G2-C6.1-LO02": {
    "topics": [
      "mt_ppENoD8vf1",
      "mt_LTb0ZReMR2"
    ],
    "protocols": [
      "nature-observation"
    ],
    "disposition": "SkillWithContextualEngagement",
    "conditions": {
      "attainmentReference": "suggestive-selected-primary-view",
      "positiveFeelingRequiredForSkillPass": false,
      "componentLinksCertifyWholeMastery": false
    }
  }
};
const correctedPrompts = {
  "mt_kvrvpQris4": "When {{name}} is frustrated — say a sibling takes their toy — can they use words to say how they feel and why, rather than snatching it back or hurting someone? They may still feel upset or cry while explaining.",
  "mt_FwI7q7DSIx": "When {{name}} is playing a board game with friends or siblings, can they wait for their turn and share the pieces without grabbing or needing adult reminders, and explain why everyone getting a fair turn helps the game? They may still feel disappointed while doing so."
};
const inheritedRole = {
  "id": "mt_PJE57bAvMG",
  "type": "CONCEPTUAL",
  "subject": "Personal & Social Development",
  "domain": "Self-Awareness",
  "name": "Social roles and changing responsibilities",
  "description": "Describe familiar social roles and relationships, connect them with responsibilities toward other people and the environment, and explain how a setting, event or changing circumstances can alter a role, relationship or duty. Use everyday examples without assuming a particular family structure or requiring private personal disclosure.",
  "ageRangeStart": 6,
  "ageRangeEnd": 7,
  "centrality": 0,
  "evidence": [
    "Describe a familiar role, such as pupil, friend, family member or someone helping care for a plant or shared place, and explain a responsibility that comes with it.",
    "Compare one person’s roles, relationships and responsibilities in two settings, explaining why a duty or way of relating to others differs.",
    "Explain how a provided event or change in circumstances alters a responsibility or relationship, including a care duty toward the environment; naming an event or expressing a feeling alone is insufficient.",
    "Apply the role–duty–circumstance relationship to a new supplied scenario, without treating duties as fixed by gender or a single family arrangement."
  ],
  "assessmentPrompt": "In a supplied story, the same child, Ari, is a pupil at school and helps care for a garden. Ari knows the school well; a new pupil does not. The story explains that plants need water when soil is dry, and the soil has become dry. Can {{name}} explain how Ari’s roles, relationships and responsibilities differ between the settings, and why each changed circumstance might change a responsibility? They may also use a non-sensitive everyday role of their own.",
  "standards": [
    "the-ontario-curriculum-social-studies-history-an:ON-SSHG-2026-G1-SS-A1",
    "the-ontario-curriculum-social-studies-history-an:ON-SSHG-2026-G1-SS-A1.1",
    "the-ontario-curriculum-social-studies-history-an:ON-SSHG-2026-G1-SS-A1.2",
    "the-ontario-curriculum-social-studies-history-an:ON-SSHG-2026-G1-SS-A2",
    "the-ontario-curriculum-social-studies-history-an:ON-SSHG-2026-G1-SS-A2.4",
    "the-ontario-curriculum-social-studies-history-an:ON-SSHG-2026-G1-SS-A2.5",
    "the-ontario-curriculum-social-studies-history-an:ON-SSHG-2026-G1-SS-A3",
    "the-ontario-curriculum-social-studies-history-an:ON-SSHG-2026-G1-SS-A3.1",
    "the-ontario-curriculum-social-studies-history-an:ON-SSHG-2026-G1-SS-A3.5",
    "the-ontario-curriculum-social-studies-history-an:ON-SSHG-2026-G1-SS-B3.8"
  ]
};
const input = {
  report: load('reports/ncert-socioemotional-alignment-2026-11-10.json'),
  protocols: load('reports/ncert-socioemotional-protocols-2026-11-10.json'),
  topics: load('data/topics.json'),
  alignments: load('data/curriculum-alignments.json'),
  ledger: load('reports/ncert-alignment-readiness-2026-11-10.json'),
};
const sorted = a => [...a].sort();
const authored = t => Object.fromEntries(Object.entries(t).filter(([k]) => !['ageRangeStart','ageRangeEnd','standards'].includes(k)));
function check(x) {
  const { report:r, protocols:p, topics:t, alignments:a, ledger:l }=x;
  const rows=r.records, byTopic=new Map(t.topics.map(q=>[q.id,q]));
  assert.equal(rows.length,46);
  assert.equal(new Set(rows.map(q=>q.key)).size,46,'unique source positions');
  assert.deepEqual(sorted(rows.map(q=>q.key)), sorted(Object.keys(expected)),'exact reviewed source keys');
  assert.equal(p.protocols.length,new Set(p.protocols.map(q=>q.id)).size,'unique protocols');
  const protocols=new Map(p.protocols.map(q=>[q.id,q]));
  const ledger=new Map(l.records.map(q=>[q.key,q]));
  let pairs=0;const contributing=new Set();
  for (const row of rows) {
    const e=expected[row.key],formal=row.key.startsWith('ncert-ncfse-');
    assert.deepEqual(sorted(row.contributions.map(q=>q.topicId)),sorted(e.topics),'reviewed component identities');
    assert.equal(row.contributions.length,new Set(row.contributions.map(q=>q.topicId)).size,'no duplicate component');
    assert.deepEqual(sorted(row.assessmentProtocols),sorted(e.protocols),'per-position protocol identities');
    assert.deepEqual(row.sourceConditions,e.conditions,'exact source performance/applicability conditions');
    assert.equal(row.disposition,e.disposition,'contextual affect is not silently erased');
    assert.deepEqual(row.ageBand,formal?[3,8]:[6,8]);
    assert.equal(row.sourceStatus,formal?'formal-stage-standard':'suggestive-contextualisable-source-position');
    assert.deepEqual(row.sourcePdfPages,ledger.get(row.key).sourcePdfPages);
    if(formal){
      assert.deepEqual(row.sourceStageScope,['Balvatika','Grade 1','Grade 2']);
      assert.deepEqual(row.selectedGradeView,[1,2]);
      assert.equal(row.requiredGradeBand,null);
      assert.equal(row.applicability.attainmentReference,'stage-end');
    } else assert.deepEqual(row.printedSourceGradeBand,ledger.get(row.key).sourceGradeBand);
    for(const id of row.assessmentProtocols)assert(protocols.has(id),'protocol must resolve');
    if(row.disposition==='SkillWithContextualEngagement')assert(row.contextualRequirement,'retained contextual channel');
    const lr=ledger.get(row.key);assert(lr,'source key present in570 ledger');
    assert.equal(lr.alignmentReviewStatus,'reviewed-in-this-slice');assert.equal(lr.disposition,row.disposition);
    assert.deepEqual(sorted(lr.proposedTopicIds),sorted(e.topics));
    assert.deepEqual(sorted(lr.assessmentProtocols),sorted(e.protocols));
    for(const c of row.contributions){
      assert.equal(c.role,'component');assert(byTopic.has(c.topicId));assert.equal(c.topicName,byTopic.get(c.topicId).name);pairs++;contributing.add(c.topicId);
      assert(a.alignments.some(q=>q.topicId===c.topicId&&q.scope==='jurisdiction'&&q.country==='IN'&&!q.region&&!q.ageOnly&&q.ageRangeStart===row.ageBand[0]&&q.ageRangeEnd===row.ageBand[1]&&q.standards.includes(row.key)),'exact-band association');
    }
    for(const q of a.alignments.filter(q=>q.standards.includes(row.key)))assert(q.scope==='jurisdiction'&&q.country==='IN'&&q.ageRangeStart===row.ageBand[0]&&q.ageRangeEnd===row.ageBand[1],'no invented alternative age/scope');
  }
  assert.equal(pairs,110);assert.equal(contributing.size,33);
  assert.equal(r.counts.records,46);assert.equal(r.counts.componentPairs,pairs);assert.equal(r.counts.reusedTopics,contributing.size);
  assert.equal(r.counts.Full,36);assert.equal(r.counts.SkillWithContextualEngagement,10);
  assert.equal(r.counts.newIndiaClaims,0);assert.equal(r.counts.newGuides,0);assert.equal(r.counts.dependencyChanges,0);
  for(const q of p.protocols)for(const id of q.includesProtocols??[])assert(protocols.has(id),'aggregate protocol resolution');
  assert.deepEqual(sorted(protocols.get('integrated-social-emotional').includesProtocols),sorted(['self-belonging','emotion-expression','regulation','peer-initiative','mutual-help','joint-play-work','rules-with-agency','kindness-care','living-care','respectful-differences']),'broad goal composes actual duties');
  for(const id of ['emotion-expression','joint-play-work'])assert.equal(protocols.get(id).conditions[id==='emotion-expression'?'noTearsRequirement':'noUpsetRequirement'],false);
  assert.equal(protocols.get('tree-seedling').conditions.localTreeSeedRequired,true);assert.equal(protocols.get('tree-seedling').conditions.beanOnlySubstitution,false);
  assert.equal(protocols.get('living-care').conditions.recurringResponsibility,true);assert.equal(protocols.get('living-care').conditions.animalDeprivation,false);
  assert.equal(protocols.get('productive-service').conditions.functionalTeachingMaterialForG2,true);assert.equal(protocols.get('productive-service').conditions.actualKitchenCleaningAndCuttingForG2,true);
  assert.equal(protocols.get('emotion-through-play-art').conditions.actualPlayAndArtExpression,true);
  assert.equal(protocols.get('peer-initiative').conditions.childInitiatedExchange,true);
  assert.deepEqual(protocols.get('instructions-and-rules').conditions.grade1InstructionRange,[3,4]);
  assert.equal(protocols.get('attention-and-persistence').conditions.universalDurationAdded,false);
  assert.equal(r.claimRevisions.length,2);assert.deepEqual(sorted(r.claimRevisions.map(q=>q.topicId)),sorted(Object.keys(correctedPrompts)));
  for(const revision of r.claimRevisions){
    const current=byTopic.get(revision.topicId);assert.deepEqual(revision.changedFields,['assessmentPrompt']);
    assert.equal(current.assessmentPrompt,correctedPrompts[revision.topicId]);assert.equal(revision.after.assessmentPrompt,current.assessmentPrompt);
    const old=authored(revision.before),next=authored(current);delete old.assessmentPrompt;delete next.assessmentPrompt;
    assert.deepEqual(old,next,'only approved prompt changes; complete other claim fields preserved');
    assert.match(revision.compatibility,/no automatic equivalence, transfer, reset or publication/);
  }
  assert.deepEqual(authored(byTopic.get(inheritedRole.id)),authored(inheritedRole),'reuse exact reviewed sibling claim');
  assert(a.alignments.some(q=>q.topicId===inheritedRole.id&&q.scope==='jurisdiction'&&q.country==='CA'&&q.ageRangeStart===6&&q.ageRangeEnd===7),'inherited Ontario interval retained');
  assert.equal(new Set(l.records.map(q=>q.key)).size,l.records.length);
  const reviewed=q=>q.alignmentReviewStatus!=='not-reviewed-in-this-slice';
  assert.equal(l.counts.catalogueRecords,l.records.length);
  assert.equal(l.counts.alignmentReviewedHere,l.records.filter(reviewed).length);
  assert.equal(l.counts.notAlignmentReviewedHere,l.records.filter(q=>!reviewed(q)).length);
  for(const group of l.groups){
    const rr=l.records.filter(q=>['source','stage','area','recordKind'].every(k=>q[k]===group[k]));
    assert.equal(group.records,rr.length);assert.equal(group.reviewedHere,rr.filter(reviewed).length);assert.equal(group.pendingHere,rr.filter(q=>!reviewed(q)).length);
  }
  for(const nav of l.nextSlices){
    for(const ng of nav.groups)assert.equal(ng.pendingRecords,l.groups.filter(q=>['source','stage','area'].every(k=>q[k]===ng[k])).reduce((n,q)=>n+q.pendingHere,0));
    assert.equal(nav.pendingRecords,nav.groups.reduce((n,q)=>n+q.pendingRecords,0));
  }
  assert.equal(l.nextSlices.reduce((n,q)=>n+q.pendingRecords,0),l.counts.notAlignmentReviewedHere,'navigation remains dynamic');
}
test('NCERT socio-emotional review binds 46 positions, 110 components, source conditions and two prompt revisions',()=>check(input));
test('SE guard rejects wrong-valid protocols, lost practical duties, mood criteria and inheritance drift',()=>{
  const mutations=[
    x=>x.report.records.find(q=>q.key.endsWith('SE-G1-C5.1-LO01')).assessmentProtocols=['roles-across-settings'],
    x=>{const p=x.protocols.protocols.find(q=>q.id==='integrated-social-emotional');p.includesProtocols=p.includesProtocols.filter(id=>id!=='living-care');},
    x=>x.protocols.protocols.find(q=>q.id==='tree-seedling').conditions.localTreeSeedRequired=false,
    x=>x.protocols.protocols.find(q=>q.id==='living-care').conditions.recurringResponsibility=false,
    x=>x.protocols.protocols.find(q=>q.id==='productive-service').conditions.functionalTeachingMaterialForG2=false,
    x=>x.report.records[0].contributions.push(clone(x.report.records[0].contributions[0])),
    x=>x.report.records.find(q=>q.disposition==='SkillWithContextualEngagement').disposition='Full',
    x=>{const rev=x.report.claimRevisions[0];x.topics.topics.find(q=>q.id===rev.topicId).assessmentPrompt=rev.before.assessmentPrompt;},
    x=>{x.alignments.alignments=x.alignments.alignments.filter(q=>!(q.topicId===inheritedRole.id&&q.scope==='jurisdiction'&&q.country==='CA'));},
    x=>{const row=x.report.records[0],id=row.contributions[0].topicId;const a=x.alignments.alignments.find(q=>q.topicId===id&&q.country==='IN'&&q.standards.includes(row.key));a.standards=a.standards.filter(k=>k!==row.key);},
    x=>x.ledger.nextSlices.find(q=>q.pendingRecords>0).pendingRecords++,
  ];
  for(const mutate of mutations){const x=clone(input);mutate(x);assert.throws(()=>check(x));}
  const future=clone(input);future.alignments.alignments.push({topicId:input.topics.topics[0].id,scope:'jurisdiction',country:'NZ',ageRangeStart:8,ageRangeEnd:9,standards:[],ageOnly:true});check(future);
});
