import React from "react";

import BranchedAddon from "devtools/components/recipes/form/arguments/BranchedAddon";
import ConsoleLog from "devtools/components/recipes/form/arguments/ConsoleLog";
import FallbackEditor from "devtools/components/recipes/form/arguments/FallbackEditor";
import MessagingExperiment from "devtools/components/recipes/form/arguments/MessagingExperiment";
import MultiPreference from "devtools/components/recipes/form/arguments/MultiPreference";
import OptOutStudy from "devtools/components/recipes/form/arguments/OptOutStudy";
import PreferenceExperiment from "devtools/components/recipes/form/arguments/PreferenceExperiment";
import PreferenceRollback from "devtools/components/recipes/form/arguments/PreferenceRollback";
import PreferenceRollout from "devtools/components/recipes/form/arguments/PreferenceRollout";
import ShowHeartBeat from "devtools/components/recipes/form/arguments/ShowHeartBeat";
import { useRecipeDetailsData } from "devtools/contexts/recipeDetails";

const ARGUMENTS_FIELDS_MAPPING = {
  "branched-addon-study": BranchedAddon,
  "console-log": ConsoleLog,
  "messaging-experiment": MessagingExperiment,
  "multi-preference-experiment": MultiPreference,
  "opt-out-study": OptOutStudy,
  "preference-experiment": PreferenceExperiment,
  "preference-rollback": PreferenceRollback,
  "preference-rollout": PreferenceRollout,
  "show-heartbeat": ShowHeartBeat,
};

export const INITIAL_ACTION_ARGUMENTS = {
  "branched-addon-study": {
    branches: [],
    isEnrollmentPaused: false,
    slug: "",
    userFacingDescription: "",
    userFacingName: "",
  },
  "console-log": { message: "" },
  "messaging-experiment": {
    branches: [],
    isEnrollmentPaused: false,
    slug: "",
  },
  "multi-preference-experiment": {
    branches: [],
    experimentDocumentUrl: "",
    slug: "",
    userFacingDescription: "",
    userFacingName: "",
  },
  "opt-out-study": {
    addonUrl: "",
    description: "",
    extensionApiId: null,
    isEnrollmentPaused: false,
    name: "",
  },
  "preference-experiment": {
    branches: [],
    experimentDocumentUrl: "",
    isEnrollmentPaused: false,
    isHighPopulation: false,
    preferenceBranchType: "default",
    preferenceName: "",
    preferenceType: "boolean",
    slug: "",
  },
  "preference-rollback": { rolloutSlug: "" },
  "preference-rollout": { slug: "", preferences: [] },
  "show-heartbeat": {
    engagementButtonLabel: "",
    includeTelemetryUUID: false,
    learnMoreMessage: "",
    learnMoreUrl: "",
    message: "",
    postAnswerUrl: "",
    repeatOption: "once",
    surveyID: "",
    surveyId: "",
    thanksMessage: "",
  },
};

export default function ActionArguments() {
  const data = useRecipeDetailsData();

  if (data.action && data.action.name) {
    if (data.action.name in ARGUMENTS_FIELDS_MAPPING) {
      const ArgumentsFields = ARGUMENTS_FIELDS_MAPPING[data.action.name];
      return <ArgumentsFields />;
    }

    return <FallbackEditor />;
  }

  return null;
}
