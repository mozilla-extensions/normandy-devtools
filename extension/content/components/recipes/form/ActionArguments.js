import React from "react";

import { useRecipeDetailsData } from "devtools/contexts/recipeDetails";
import FallbackEditor from "devtools/components/recipes/form/arguments/FallbackEditor";
import PreferenceExperiment from "devtools/components/recipes/form/arguments/PreferenceExperiment";
import MessagingExperiment from "devtools/components/recipes/form/arguments/MessagingExperiment";
import ConsoleLog from "devtools/components/recipes/form/arguments/ConsoleLog";
import ShowHeartBeat from "devtools/components/recipes/form/arguments/ShowHeartBeat";

const ARGUMENTS_FIELDS_MAPPING = {
  "console-log": ConsoleLog,
  "messaging-experiment": MessagingExperiment,
  "preference-experiment": PreferenceExperiment,
  "show-heartbeat": ShowHeartBeat,
};

export const INITIAL_ACTION_ARGUMENTS = {
  "console-log": { message: "" },
  "messaging-experiment": {
    branches: [],
    isEnrollmentPaused: false,
    slug: "",
  },
  "preference-experiment": {
    branches: [],
    experimentDocumentUrl: "",
    isEnrollmentPaused: false,
    isHighVolume: false,
    preferenceBranchType: "default",
    preferenceName: "",
    preferenceType: "boolean",
    slug: "",
  },
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
