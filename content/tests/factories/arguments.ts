import faker from "faker";

import Factory from "devtools/tests/factories";
import {
  ConsoleLogArguments,
  MultiPreferenceExperimentArguments,
  ActionArguments,
  BranchedAddonStudyArguments,
  UnknownArguments,
  ShowHeartbeatArguments,
  PreferenceRolloutArguments,
} from "devtools/types/arguments";

export const consoleLogArgumentsFactory = Factory.fromFields<
  ConsoleLogArguments
>({
  message: () => faker.lorem.sentence(),
});

export const multiPrefExperimentArgumentsFactory = Factory.fromFields<
  MultiPreferenceExperimentArguments
>({
  slug: () => faker.random.word(),
  branches: [],
  isEnrollmentPaused: false,
  isHighPopulation: false,
  userFacingName: () => faker.random.word(),
  userFacingDescription: () => faker.lorem.sentence(),
  experimentDocumentUrl: "",
});

const preferenceRolloutArgumentsFactory = Factory.fromFields<
  PreferenceRolloutArguments
>({
  preferences: [],
  slug: () => faker.lorem.slug(),
});
const branchedAddonStudyArgumentsFactory = Factory.fromFields<
  BranchedAddonStudyArguments
>({
  branches: [],
  isEnrollmentPaused: false,
  userFacingName: () => faker.lorem.words(),
  userFacingDescription: () => faker.lorem.sentences(),
  slug: {
    dependencies: ["userFacingName"],
    generator: (_, { userFacingName }): string =>
      userFacingName.replace(" ", "-").toLowerCase(),
  },
});

export const showHeartbeatArgumentsFactory = Factory.fromFields<
  ShowHeartbeatArguments
>({
  surveyId: () => faker.lorem.slug(),
});

export const unknownArgumentsFactory = new Factory<UnknownArguments>(
  () => ({}),
);

const argumentFactoriesByAction = {
  "console-log": consoleLogArgumentsFactory,
  "multi-preference-experiment": multiPrefExperimentArgumentsFactory,
  "branched-addon-study": branchedAddonStudyArgumentsFactory,
  "preference-rollout": preferenceRolloutArgumentsFactory,
  "show-heartbeat": showHeartbeatArgumentsFactory,
  unknown: unknownArgumentsFactory,
};

export const actionArgumentsFactory = new Factory(
  (
    partial: Partial<ActionArguments>,
    options: { actionName?: string } = {},
  ): ActionArguments => {
    // eslint-disable-next-line prefer-const
    let { actionName, ...passThroughOptions } = options;
    if (!actionName) {
      actionName = faker.random.arrayElement(
        Object.keys(argumentFactoriesByAction),
      );
    }

    const factory = argumentFactoriesByAction[actionName];
    if (!factory) {
      throw new Error(
        `Don't know how to make arguments for a "${actionName}" action`,
      );
    }

    return factory.build(
      partial as Partial<ConsoleLogArguments>,
      passThroughOptions,
    );
  },
);
