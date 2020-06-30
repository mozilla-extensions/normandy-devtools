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
      let actionArgs;
      switch (actionName) {
        case "console-log":
          actionArgs = ConsoleLogArgumentFactory.build();
          break;
        case "multi-preference-experiment":
          actionArgs = MultiPreferenceFactory.build();
          break;
        case "opt-out-study":
          actionArgs = AddOnArgumentFactory.build();
          break;
        case "branched-addon-study":
          actionArgs = BranchedAddonArgumentFactory.build();
          break;
        default:
          actionArgs = {};
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
      recipe: new SubFactory(RevisionRecipeFactory),
    };
  }
}

class RevisionRecipeFactory extends Factory {
  getFields() {
    return {
      approved_revision_id: new Field(faker.random.number),
      id: new Field(faker.random.number),
      latest_revision_id: new Field(faker.random.number),
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

export class ApprovalRequestFactory extends Factory {
  getFields() {
    return {
      approved: new Field(faker.random.boolean),
      approver: new SubFactory(UserFactory),
      comment: new Field(faker.lorem.sentence),
      created: new Field(faker.date.recent),
      creator: new SubFactory(UserFactory),
    };
  }

  postGeneration() {
    const { empty } = this.options;
    if (empty) {
      this.data.approved = null;
      this.data.approver = null;
      this.data.comment = null;
    }
  }
}
class ConsoleLogArgumentFactory extends Factory {
  getFields() {
    return { message: new Field(faker.lorem.words) };
  }
}

class AddOnArgumentFactory extends Factory {
  getFields() {
    return {
      addonUrl: new Field(faker.internet.url),
      description: new Field(faker.lorem.words),
      extensionApiId: new Field(faker.random.number),
      isEnrollmentPaused: new Field(faker.random.boolean),
      name: new Field(faker.commerce.productName),
    };
  }
}

class BranchedAddonArgumentFactory extends Factory {
  getFields() {
    return {
      branches: [],
      isEnrollmentPaused: new Field(faker.random.boolean),
      slug: new Field(faker.lorem.slug),
      userFacingDescription: new Field(faker.lorem.words),
      userFacingName: new Field(faker.commerce.productName),
    };
  }
}

export class AddOnBranchFactory extends Factory {
  getFields() {
    return {
      extensionApiId: new Field(faker.random.number),
      slug: new Field(faker.lorem.slug),
      ratio: new Field(faker.random.number),
    };
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
