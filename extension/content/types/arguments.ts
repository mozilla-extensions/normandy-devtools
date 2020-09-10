export type ActionArguments =
  | ConsoleLogArguments
  | BranchedAddonStudyArguments
  | MultiPreferenceExperimentPrefs
  | UnknownArguments;

export interface ConsoleLogArguments {
  message: string;
}

export interface BranchedAddonStudyArguments {
  slug: string;
  userFacingName: string;
  userFacingDescription: string;
  branches: Array<BranchedAddonStudyBranch>;
  isEnrollmentPaused: boolean;
}

export interface BranchedAddonStudyBranch {
  slug: string;
  ratio: number;
  extensionApiId: number;
}

export interface MultiPreferenceExperimentArguments {
  slug: string;
  branches: Array<MultiPreferenceExperimentBranch>;
  isEnrollmentPaused: boolean;
  isHighPopulation: boolean;
  userFacingName: string;
  userFacingDescription: string;
  experimentDocumentUrl: string;
}

export interface MultiPreferenceExperimentBranch {
  slug: string;
  ratio: number;
  preferences: MultiPreferenceExperimentPrefs;
}

export interface MultiPreferenceExperimentPrefs {
  [key: string]: {
    preferenceBranchType: "default" | "user";
    preferenceType: "string" | "boolean" | "integer";
    value: string | boolean | number;
  };
}

export interface ShowHeartbeatArguments {
  surveyId: string;
}

export type UnknownArguments = Record<string, unknown>;
