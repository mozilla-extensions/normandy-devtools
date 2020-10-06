import faker from "faker";

import Factory, { autoIncrementField } from "devtools/tests/factories";
import { actionFactory } from "devtools/tests/factories/api";
import { actionArgumentsFactory } from "devtools/tests/factories/arguments";
import { filterObjectFactory } from "devtools/tests/factories/filterObjects";
import {
  BranchedAddonStudyBranch,
  MultiPreferenceExperimentBranch,
} from "devtools/types/arguments";
import {
  User,
  RecipeV3,
  Revision,
  ApprovalRequest,
  RecipeReference,
} from "devtools/types/recipes";

export const userFactory = Factory.fromFields<User>({
  id: faker.random.number,
  first_name: () => faker.name.firstName(),
  last_name: () => faker.name.lastName(),
  email: {
    dependencies: ["first_name", "last_name"],
    generator: (_options, obj): string =>
      faker.internet.email(obj.first_name, obj.last_name),
  },
});

export const approvalRequestFactory = Factory.fromFields<
  ApprovalRequest,
  { empty: boolean }
>({
  id: () => faker.random.number(),
  approved: ({ empty = false }) => (empty ? null : true),
  approver: ({ empty = false }) => (empty ? null : userFactory.build()),
  comment: ({ empty = false }) => (empty ? null : faker.lorem.sentence()),
  created: () => faker.date.recent().toISOString(),
  creator: { subfactory: userFactory },
});

export const revisionFactory = Factory.fromFields<
  Revision,
  { actionName?: string; recipeId?: number }
>({
  action: { subfactory: actionFactory },
  approval_request: { subfactory: approvalRequestFactory },
  arguments: {
    subfactory: actionArgumentsFactory,
    dependencies: ["action"],
    passOptions: (_, partial): { actionName: string } => ({
      actionName: partial?.action?.name,
    }),
  },
  comment: () => faker.lorem.sentence(),
  creator: { subfactory: userFactory },
  date_created: () => faker.date.past().toUTCString(),
  enabled: true,
  experimenter_slug: () => faker.lorem.slug(),
  extra_filter_expression: (): string => `"${faker.random.word()}"`,
  filter_expression: {
    dependencies: ["extra_filter_expression", "filter_object"],
    generator: (_, partial): string =>
      [
        partial.extra_filter_expression,
        ...partial.filter_object.map((fo) => fo.type),
      ].join(" && "),
  },
  filter_object: () => filterObjectFactory.buildCount(3),
  id: autoIncrementField(),
  is_approved: true,
  name: () => faker.random.word(),
  updated: () => faker.date.past().toUTCString(),
  recipe: {
    dependencies: ["id"],
    generator: (options, partial): RecipeReference => {
      return {
        id: options.recipeId || faker.random.number(),
        approved_revision_id: null,
        latest_revision_id: partial.id,
      };
    },
  },
});

export const recipeFactory = Factory.fromFields<RecipeV3>({
  id: autoIncrementField(),
  latest_revision: {
    subfactory: revisionFactory,
    dependencies: ["id"],
    passOptions: (_option, _input, partialRecipe): { recipeId: number } => {
      return { recipeId: partialRecipe.id };
    },
  },
  approved_revision: null,
});

export const addonStudyBranchFactory = Factory.fromFields<
  BranchedAddonStudyBranch
>({
  slug: () => faker.lorem.slug(),
  ratio: () => faker.random.number(10),
  extensionApiId: autoIncrementField(),
});

export const multiPrefBranchFactory = Factory.fromFields<
  MultiPreferenceExperimentBranch
>({
  slug: () => faker.lorem.slug(),
  ratio: () => faker.random.number(10),
  preferences: () => {
    const rv = {};
    for (let i = 0; i < 3; i++) {
      const prefName = [0, 1, 2]
        .map(() => faker.random.word().toLowerCase())
        .join(".");
      const preferenceType = faker.random.arrayElement([
        "string",
        "integer",
        "boolean",
      ]);
      const preferenceBranchType = faker.random.arrayElement([
        "user",
        "default",
      ]);

      let preferenceValue;
      switch (preferenceType) {
        case "string":
          preferenceValue = faker.random.word();
          break;
        case "integer":
          preferenceValue = faker.random.number();
          break;
        case "boolean":
          preferenceValue = faker.random.boolean();
          break;
        default:
          throw Error(`Unexpected prefType ${preferenceType}`);
      }

      rv[prefName] = {
        preferenceBranchType,
        preferenceType,
        preferenceValue,
      };
    }

    return rv;
  },
});
