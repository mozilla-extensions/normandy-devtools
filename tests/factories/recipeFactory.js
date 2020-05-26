import faker from "faker";
import { Factory, SubFactory, Field } from "./factory";
import {
  versionFilterObjectFactory,
  channelFilterObjectFactory,
} from "./filterObjectFactory";

class RecipeFactory extends Factory {
  getFields() {
    return {
      action: {},
      arguments: {},
      experimenter_slug: new Field(faker.lorem.slug),
      extra_filter_expression: new Field(faker.lorem.words),
      filter_expression: new Field(faker.lorem.words),
      filter_object: [],
    };
  }

  postGeneration() {
    const versionFO = versionFilterObjectFactory.build();
    const channelFO = channelFilterObjectFactory.build();
    this.data.filter_object = [
      ...this.data.filter_object,
      versionFO,
      channelFO,
    ];
  }
}

export class ConsoleLogRecipeFactory extends Factory {
  getFields() {
    return {
      id: new Field(faker.random.number),
      latest_revision: new SubFactory(RecipeFactory),
      name: new Field(faker.lorem.words),
    };
  }

  postGeneration() {
    const action = { name: "console-log", id: 1 };
    const args = { message: faker.lorem.words() };

    this.data.latest_revision = {
      ...this.data.latest_revision,
      arguments: args,
      action,
    };
  }
}
