import {
  render,
  cleanup,
  waitFor,
  fireEvent,
  within,
} from "@testing-library/react";
import React from "react";

import "@testing-library/jest-dom/extend-expect";
import App from "devtools/components/App";
import NormandyAPI from "devtools/utils/normandyApi";

import { ActionsResponse, FiltersFactory } from "./factories/filterFactory";
import {
  VersionFilterObjectFactory,
  ChannelFilterObjectFactory,
  BucketSampleFilterObjectFactory,
} from "./factories/filterObjectFactory";
import { RecipeFactory } from "./factories/recipeFactory";

describe("The `RecipeForm` component", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  const findForm = (formGroups, formName) => {
    const forms = formGroups.filter((form) =>
      within(form).queryByText(formName),
    );
    return forms.reduce((a, b) => (a.length <= b.length ? a : b));
  };

  const getForms = (formGroups) => {
    const nameForm = findForm(formGroups, "Name");
    const experimenterSlugForm = findForm(formGroups, "Experimenter Slug");
    const samplingTypeForm = findForm(formGroups, "Sampling Type");
    const channelForm = findForm(formGroups, "Channel");
    const versionForm = findForm(formGroups, "Version");
    const countriesForm = findForm(formGroups, "Countries");
    const localesForm = findForm(formGroups, "Locales");
    const fallbackFOForm = findForm(formGroups, "Additional Filter Objects");
    const actionForm = findForm(formGroups, "Action");
    return {
      nameForm,
      experimenterSlugForm,
      samplingTypeForm,
      channelForm,
      versionForm,
      countriesForm,
      localesForm,
      fallbackFOForm,
      actionForm,
    };
  };

  const getPrefFields = (forms) => {
    const experimentSlugForm = findForm(forms, "Experiment Slug");
    const preferenceNameForm = findForm(forms, "Preference Name");
    const experimentDocURLForm = findForm(forms, "Experiment Document URL");
    const prefTypeForm = findForm(forms, "Preference Type");
    const prefBranchTypeForm = findForm(forms, "Preference Branch Type");
    const highVolumeForm = findForm(forms, "High Volume Recipe");
    const preventEnrollmentForm = findForm(forms, "Prevent New Enrollment");
    const addBranchForm = findForm(forms, "Add Branch");

    const experimentSlugField = experimentSlugForm.querySelector("input");
    const prefNameField = preferenceNameForm.querySelector("input");
    const expUrlField = experimentDocURLForm.querySelector("input");

    const prefTypeField = within(prefTypeForm).getByRole("combobox");
    const prefBranchTypeField = within(prefBranchTypeForm).getByRole(
      "combobox",
    );
    const highVolumeField = within(highVolumeForm).getByRole("button");
    const preventNewEnrollField = within(preventEnrollmentForm).getByRole(
      "button",
    );
    const addBranchButton = within(addBranchForm).getByText("Add Branch");

    return {
      experimentSlugField,
      prefNameField,
      expUrlField,
      prefTypeField,
      prefBranchTypeField,
      highVolumeField,
      preventNewEnrollField,
      addBranchButton,
    };
  };

  const setup = () => {
    const versions = VersionFilterObjectFactory.build(
      {},
      { generateVersionsCount: 2 },
    );
    const channels = ChannelFilterObjectFactory.build(
      {},
      { generateChannelsCount: 1 },
    );
    const sample = BucketSampleFilterObjectFactory.build();
    const filterObject = [versions, sample, channels];
    const recipe = RecipeFactory.build(
      {},
      {
        actionName: "console-log",
        filterObject,
      },
    );
    const pageResponse = { results: [recipe] };
    const filtersResponse = FiltersFactory.build(
      {},
      { countries: 3, locales: 3 },
    );

    jest
      .spyOn(NormandyAPI.prototype, "fetchRecipePage")
      .mockImplementation(() => Promise.resolve(pageResponse));
    jest
      .spyOn(NormandyAPI.prototype, "fetchFilters")
      .mockImplementation(() => Promise.resolve(filtersResponse));
    jest
      .spyOn(NormandyAPI.prototype, "fetchAllActions")
      .mockImplementation(() => Promise.resolve(ActionsResponse()));

    jest
      .spyOn(NormandyAPI.prototype, "saveRecipe")
      .mockImplementation(() => Promise.resolve(jest.fn()));

    jest
      .spyOn(NormandyAPI.prototype, "fetchRecipe")
      .mockImplementation(() => Promise.resolve(recipe));

    return recipe;
  };

  it("creation recipe form", async () => {
    setup();
    const { getByText, getAllByRole } = await render(<App />);
    fireEvent.click(getByText("Create Recipe"));
    await waitFor(() =>
      expect(getByText("Experimenter Slug")).toBeInTheDocument(),
    );
    let formGroups = getAllByRole("group");

    const {
      nameForm,
      experimenterSlugForm,
      samplingTypeForm,
      channelForm,
      versionForm,
      actionForm,
    } = getForms(formGroups);

    const nameInput = nameForm.querySelector("input");
    const experimenterSlugInput = experimenterSlugForm.querySelector("input");
    const versionInput = versionForm.querySelector("input");
    const samplingInput = within(samplingTypeForm).getByRole("combobox");

    fireEvent.change(nameInput, { target: { value: "Recipe Name" } });
    fireEvent.change(experimenterSlugInput, {
      target: { value: "the-experimenter-slug" },
    });

    fireEvent.click(samplingInput);
    fireEvent.click(getByText("Stable"));

    formGroups = getAllByRole("group");

    const rateForm = findForm(formGroups, "Rate");
    const inputForm = findForm(formGroups, "Input");
    const rateInput = rateForm.querySelector("input");
    const inputInput = within(inputForm).getByRole("combobox");

    fireEvent.change(rateInput, { target: { value: 5 } });
    fireEvent.click(inputInput);
    fireEvent.click(getByText("normandy.recipe.id"));

    fireEvent.change(versionInput, { target: { value: 88 } });
    fireEvent.click(versionForm.querySelector("button"));
    fireEvent.click(getByText("Add"));
    fireEvent.click(versionForm.querySelector("button"));
    fireEvent.click(getByText("Add"));

    fireEvent.click(within(channelForm).getByText("Beta"));
    fireEvent.click(within(channelForm).getByText("Release"));

    const actionInput = within(actionForm).getByRole("combobox");
    expect(NormandyAPI.prototype.fetchAllActions).toHaveBeenCalled();
    fireEvent.click(actionInput);
    fireEvent.click(getByText("preference-experiment"));

    formGroups = getAllByRole("group");
    const {
      experimentSlugField,
      prefNameField,
      expUrlField,
      prefTypeField,
      prefBranchTypeField,
      highVolumeField,
      preventNewEnrollField,
      addBranchButton,
    } = getPrefFields(formGroups);

    fireEvent.change(experimentSlugField, {
      target: { value: "experimenter-slug-field" },
    });
    fireEvent.change(prefNameField, { target: { value: "pref1.name" } });
    fireEvent.change(expUrlField, { target: { value: "https://example.com" } });

    fireEvent.click(prefTypeField);
    fireEvent.click(getByText("String"));

    fireEvent.click(prefBranchTypeField);
    fireEvent.click(getByText("User"));

    fireEvent.click(highVolumeField);
    fireEvent.click(preventNewEnrollField);

    fireEvent.click(addBranchButton);

    formGroups = getAllByRole("group");
    const branchNameForm = findForm(formGroups, "Branch Name");
    const valueForm = findForm(formGroups, "Value");

    const branchNameInput = branchNameForm.querySelector("input");
    const valueInput = valueForm.querySelector("input");

    fireEvent.change(branchNameInput, { target: { value: "branch1" } });
    fireEvent.change(valueInput, { target: { value: "pref value" } });

    getByText("Save");
    fireEvent.click(getByText("Save"));

    const modalDialog = getAllByRole("dialog")[0];
    const commentInput = modalDialog.querySelector("textArea");
    const saveMessage = "Created Recipe";
    fireEvent.change(commentInput, { target: { value: saveMessage } });

    fireEvent.click(within(modalDialog).getByText("Save"));

    expect(NormandyAPI.prototype.saveRecipe).toBeCalledWith(undefined, {
      action_id: 3,
      arguments: {
        branches: [
          {
            ratio: 1,
            slug: "branch1",
            value: "pref value",
          },
        ],
        experimentDocumentUrl: "https://example.com",
        isEnrollmentPaused: true,
        isHighPopulation: true,
        preferenceBranchType: "user",
        preferenceName: "pref1.name",
        preferenceType: "string",
        slug: "experimenter-slug-field",
      },
      comment: saveMessage,
      experimenter_slug: "the-experimenter-slug",
      filter_object: [
        { input: ["normandy.recipe.id"], rate: 0.05, type: "stableSample" },
        {
          type: "version",
          versions: [89, 90],
        },
        {
          channels: ["beta", "release"],
          type: "channel",
        },
      ],
      name: "Recipe Name",
    });
  });

  it("edit recipe form", async () => {
    const recipeData = setup();
    const { getByText, getAllByRole } = await render(<App />);

    await waitFor(() => {
      expect(getByText("Edit Recipe")).toBeInTheDocument();
    });
    fireEvent.click(getByText("Edit Recipe"));
    await waitFor(() => {
      expect(getByText("Experimenter Slug")).toBeInTheDocument();
    });

    const formGroups = getAllByRole("group");

    const { nameForm, experimenterSlugForm, channelForm } = getForms(
      formGroups,
    );

    const messageForm = findForm(formGroups, "Message");

    const nameInput = nameForm.querySelector("input");
    const experimenterSlugInput = experimenterSlugForm.querySelector("input");
    const messageInput = messageForm.querySelector("input");

    const name = "A new Recipe Name";
    const experimenter_slug = "the-new-experinenter-slug";
    const message = "recipe message";

    fireEvent.change(nameInput, { target: { value: name } });
    fireEvent.change(experimenterSlugInput, {
      target: { value: experimenter_slug },
    });

    const all_channels = ["Nightly", "Developer Edition", "Beta", "Release"];
    for (const channel of all_channels) {
      fireEvent.click(within(channelForm).getByText(channel));
    }

    fireEvent.change(messageInput, { target: { value: message } });

    fireEvent.click(getByText("Save"));

    const modalDialog = getAllByRole("dialog")[0];
    const commentInput = modalDialog.querySelector("textArea");
    const saveMessage = "Edited Recipe";
    fireEvent.change(commentInput, { target: { value: saveMessage } });

    fireEvent.click(within(modalDialog).getByText("Save"));

    const { latest_revision } = recipeData;

    /* eslint-disable prefer-const */
    let {
      action,
      comment: _omitComment,
      ...updatedRecipeData
    } = latest_revision;
    /* eslint-enable prefer-const */
    const channelValues = ["nightly", "aurora", "beta", "release"];

    updatedRecipeData = {
      ...updatedRecipeData,
      experimenter_slug,
      name,
      comment: saveMessage,
      action_id: action.id,
      arguments: { ...updatedRecipeData.arguments, message },
      filter_object: updatedRecipeData.filter_object.map((fo) => {
        if (fo.type === "channel") {
          return {
            ...fo,
            channels: channelValues.filter((c) => !fo.channels.includes(c)),
          };
        }

        return fo;
      }),
    };

    expect(NormandyAPI.prototype.saveRecipe).toBeCalledWith(
      recipeData.id.toString(),
      updatedRecipeData,
    );
  });

  it("save button is re-enabled when form errors are addressed", async () => {
    const recipeData = setup();
    const { getByText, getAllByRole } = await render(<App />);

    fireEvent.click(getByText("Recipes"));

    await waitFor(() => {
      expect(getByText("Edit Recipe")).toBeInTheDocument();
    });
    fireEvent.click(getByText("Edit Recipe"));
    await waitFor(() => {
      expect(getByText("Experimenter Slug")).toBeInTheDocument();
    });

    const formGroups = getAllByRole("group");
    const { fallbackFOForm } = getForms(formGroups);

    const saveButton = getByText("Save");
    expect(saveButton).not.toHaveAttribute("disabled");

    const foCodeBlock = fallbackFOForm.querySelector("textarea");

    const clipboardEvent = new Event("paste", {
      bubbles: true,
      cancelable: true,
      composed: true,
    });

    clipboardEvent.clipboardData = {
      getData: () => "invalid json!",
    };
    foCodeBlock.dispatchEvent(clipboardEvent);

    expect(getByText("[]invalid json!")).toBeInTheDocument();
    expect(getByText("Filter Object(s) is not valid JSON")).toBeInTheDocument();
    expect(
      getByText("Filter Object(s) is not contained in an array"),
    ).toBeInTheDocument();
    expect(saveButton).toHaveAttribute("disabled");

    //ctrl z... the paste
    foCodeBlock.dispatchEvent(new Event("focus"));
    foCodeBlock.dispatchEvent(
      new KeyboardEvent("keydown", { keyCode: 90, ctrlKey: true }),
    );

    expect(getByText("[]")).toBeInTheDocument();
    expect(saveButton).not.toHaveAttribute("disabled");

    fireEvent.click(saveButton);

    const modalDialog = getAllByRole("dialog")[0];
    const commentInput = modalDialog.querySelector("textArea");
    const saveMessage = "Edited Recipe";
    fireEvent.change(commentInput, { target: { value: saveMessage } });

    fireEvent.click(within(modalDialog).getByText("Save"));

    const { latest_revision } = recipeData;

    /* eslint-disable prefer-const */
    let {
      action,
      comment: _omitComment,
      ...updatedRecipeData
    } = latest_revision;
    /* eslint-enable prefer-const */

    updatedRecipeData = {
      ...updatedRecipeData,
      comment: saveMessage,
      action_id: action.id,
    };

    expect(NormandyAPI.prototype.saveRecipe).toBeCalledWith(
      recipeData.id.toString(),
      updatedRecipeData,
    );
  });
});
