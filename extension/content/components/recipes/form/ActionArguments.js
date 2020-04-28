import React from "react";

import { useRecipeDetailsData } from "devtools/contexts/recipeDetails";
import FallbackEditor from "devtools/components/recipes/form/arguments/FallbackEditor";
import ConsoleLog from "devtools/components/recipes/form/arguments/ConsoleLog";
import PreferenceExperimentArguments from "devtools/components/recipes/form/arguments/PreferenceExperimentArguments";
import PreferenceRollback from "devtools/components/recipes/form/arguments/PreferenceRollback";
import ShowHeartBeat from "devtools/components/recipes/form/arguments/ShowHeartBeat";

const ARGUMENTS_FIELDS_MAPPING = {
  "console-log": ConsoleLog,
  "preference-experiment": PreferenceExperimentArguments,
  "preference-rollback": PreferenceRollback,
  "show-heartbeat": ShowHeartBeat,
};

export const INITIAL_ACTION_ARGUMENTS = {
  "console-log": { message: "" },
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
  "preference-rollback": { rolloutSlug: "" },
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
