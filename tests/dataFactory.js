import faker from "faker";
import { Factory, Field } from "./factory";

export class ConsoleLogRecipeFactory extends Factory {
  getFields() {
    return {
      latest_revision: {},
    };
  }
  postGeneration() {
    super.postGeneration();
    this.data.latest_revision = RevisionFactory.build();
  }
}

export class RevisionFactory extends Factory {
  getFields() {
    return {
      name: new Field(faker.lorem.words),
      action: { id: 4 },
      arguments: {},
      extra_filter_expression: new Field(faker.lorem.words),
    };
  }
  postGeneration() {
    super.postGeneration();
    this.data.arguments = ArgumentsFactory.build();
  }
}

export class ArgumentsFactory extends Factory {
  getFields() {
    return {
      message: new Field(faker.lorem.words),
    };
  }
}
export const ActionsResponse = () => {
  const actionNames = [
    "show-heartbeat",
    "opt-out-study",
    "preference-experiment",
    "console-log",
    "preference-rollout",
    "preference-rollback",
    "addon-study",
    "branched-addon-study",
    "multi-preference-experiment",
  ];
  const actionResults = actionNames.map((action, index) => {
    return { id: index + 1, name: action };
  });

  return { results: actionResults };
};
