import faker from "faker";

import { AutoIncrementField, Factory, SubFactory, Field } from "./factory";

export class RecipeFactory extends Factory {
  getFields() {
    return {
      id: new Field(faker.random.number),
      latest_revision: new SubFactory(RevisionFactory),
      approved_revision: null,
    };
  }

  postGeneration() {
    const { filterObject } = this.options;
    this.generateActionFields();
    this.data.latest_revision.filter_object = filterObject;
  }

  generateActionFields() {
    const { actionName } = this.options;
    if (actionName) {
      let actionArgs = {};
      if (actionName === "console-log") {
        actionArgs = ConsoleLogArgumentFactory.build();
      }

      if (actionName === "multi-preference-experiment") {
        actionArgs = MultiPreferenceFactory.build();
      }

      this.data.latest_revision = {
        ...this.data.latest_revision,
        arguments: actionArgs,
        action: ActionFactory.build({ name: actionName }),
      };
    }
  }
}

class RevisionFactory extends Factory {
  getFields() {
    return {
      action: new SubFactory(ActionFactory),
      approval_request: new SubFactory(ApprovalRequestFactory),
      arguments: {},
      comment: new Field(faker.lorem.words),
      creator: new SubFactory(UserFactory),
      date_created: new Field(faker.date.past),
      enabled: new Field(faker.random.boolean),
      experimenter_slug: new Field(faker.lorem.slug),
      extra_filter_expression: new Field(faker.lorem.words),
      filter_expression: new Field(faker.lorem.words),
      filter_object: [],
      id: new Field(faker.random.number),
      name: new Field(faker.lorem.words),
      updated: new Field(faker.date.recent),
    };
  }
}

class ActionFactory extends Factory {
  getFields() {
    const { name } = this.options;
    return {
      id: new AutoIncrementField(),
      implementationUrl: new Field(faker.internet.url),
      name: name ? name : new Field(faker.lorem.slug),
    };
  }
}

class UserFactory extends Factory {
  getFields() {
    return {
      email: new Field(faker.internet.email),
      first_name: new Field(faker.name.firstName),
      id: new Field(faker.random.number),
      last_name: new Field(faker.name.lastName),
    };
  }
}

class ApprovalRequestFactory extends Factory {
  getFields() {
    return {
      approved: new Field(faker.random.boolean),
      approver: new SubFactory(UserFactory),
      comment: new Field(faker.lorem.sentence),
      created: new Field(faker.date.recent),
      creator: new SubFactory(UserFactory),
    };
  }
}
class ConsoleLogArgumentFactory extends Factory {
  getFields() {
    return { message: new Field(faker.lorem.words) };
  }
}

export class MultiPreferenceFactory extends Factory {
  getFields() {
    return {
      branches: [],
      experimentDocumentUrl: new Field(faker.internet.url),
      slug: new Field(faker.lorem.slug),
      userFacingDescription: new Field(faker.lorem.sentence),
      userFacingName: new Field(faker.lorem.words),
    };
  }
}

export class MultiPrefBranchFactory extends Factory {
  getFields() {
    return {
      slug: new Field(faker.lorem.slug),
      ratio: new Field(faker.random.number),
      preferences: [],
    };
  }

  postGeneration() {
    const { generatePreferenceCount } = this.options;
    const preferences = {};
    const prefBranchOptions = ["user", "default"];
    const prefTypeOptions = ["integer", "string", "boolean"];
    const prefValueOptions = {
      integer: faker.random.number(),
      string: faker.random.word(),
      boolean: faker.random.boolean(),
    };

    for (let i = 0; i < generatePreferenceCount; i++) {
      const preferenceName = faker.lorem.slug();
      const preferenceBranchType = faker.random.arrayElement(prefBranchOptions);
      const preferenceType = faker.random.arrayElement(prefTypeOptions);
      const preferenceValue = prefValueOptions[preferenceType];
      const preference = {
        preferenceBranchType,
        preferenceType,
        preferenceValue,
      };
      preferences[preferenceName] = preference;
    }

    this.data.preferences = preferences;
  }
}
