import React from "react";

import { useRecipeDetailsData } from "devtools/contexts/recipeDetails";
import FallbackEditor from "devtools/components/recipes/form/arguments/FallbackEditor";
import PreferenceExperimentArguments from "devtools/components/recipes/form/arguments/PreferenceExperimentArguments";
import ConsoleLog from "devtools/components/recipes/form/arguments/ConsoleLog";
const ARGUMENTS_FIELDS_MAPPING = {
  "preference-experiment": PreferenceExperimentArguments,
  "console-log": ConsoleLog,
};

export const INITIAL_ACTION_ARGUMENTS = {
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
  "console-log": { message: "" },
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
