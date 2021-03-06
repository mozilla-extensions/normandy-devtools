import { cleanup, waitFor, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import _ from "lodash";
import React from "react";
import "@testing-library/jest-dom/extend-expect";

import RecipeFormPage from "devtools/components/pages/RecipeFormPage";
import {
  filtersApiResponseFactory,
  extensionFactory,
} from "devtools/tests/factories/api";
import { experimenterResponseFactory } from "devtools/tests/factories/experiments";
import {
  versionFoFactory,
  channelFoFactory,
  bucketSampleFoFactory,
} from "devtools/tests/factories/filterObjects";
import {
  recipeFactory,
  addonStudyBranchFactory,
  multiPrefBranchFactory,
} from "devtools/tests/factories/recipes";
import { MultiPreferenceExperimentArguments } from "devtools/types/arguments";
import { ExperimenterRecipePreview } from "devtools/types/experimenterApi";
import { Extension } from "devtools/types/normandyApi";
import { RecipeV3 } from "devtools/types/recipes";
import ExperimenterAPI from "devtools/utils/experimenterApi";
import NormandyAPI, { RevisionForPost } from "devtools/utils/normandyApi";

describe("The `RecipeForm` component", () => {
  beforeEach(() => {
    restoreConsole();
    jest.spyOn(NormandyAPI.prototype, "fetchAllRecipes").mockResolvedValue([]);
  });

  afterEach(async () => {
    await jest.clearAllMocks();
    await cleanup();
    modifyConsole();
  });

  const findForm = (formGroups, formName): HTMLElement => {
    const forms = formGroups.filter((form) =>
      within(form).queryByText(formName),
    );
    if (!forms.length) {
      throw new Error(`Form group "${formName}" not found on the page`);
    }

    return forms.reduce((a, b) => (a.length <= b.length ? a : b));
  };

  const getForms = (formGroups): Record<string, HTMLElement> => {
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

  const getPrefFields = (forms): Record<string, HTMLElement> => {
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

  const getAddonFields = (forms): Record<string, HTMLElement> => {
    const studyNameForm = findForm(forms, "Study Name");
    const studyDescriptionForm = findForm(forms, "Study Description");
    const extensionForm = findForm(forms, "Extension");
    const preventNewEnrollmentForm = findForm(forms, "Prevent New Enrollment");

    return {
      studyNameForm,
      studyDescriptionForm,
      extensionForm,
      preventNewEnrollmentForm,
    };
  };

  const getHeartBeatFields = (forms): Record<string, HTMLElement> => {
    const surveyIDForm = findForm(forms, "Survey ID");
    const engagementButtonForm = findForm(forms, "Engagement Button Label");
    const messageForm = findForm(forms, "Message");
    const thanksMessageForm = findForm(forms, "Thanks Message");
    const learnMessageForm = findForm(forms, "Learn More Message");
    const learnMoreUrlForm = findForm(forms, "Learn More Url");
    const postAnswerURLForm = findForm(forms, "Post-Answer URL");
    const promptForm = findForm(forms, "How often should the prompt be shown?");
    const includeTelemetryForm = findForm(forms, "Include Telemetry UUID?");
    return {
      surveyIDForm,
      engagementButtonForm,
      messageForm,
      thanksMessageForm,
      learnMessageForm,
      learnMoreUrlForm,
      postAnswerURLForm,
      promptForm,
      includeTelemetryForm,
    };
  };

  const setup = (...recipes: Array<RecipeV3>): void => {
    const pageResponse = {
      results: recipes,
      count: recipes.length,
      previous: null,
      next: null,
    };
    const filtersResponse = filtersApiResponseFactory.build(
      {},
      { countryCount: 3, localeCount: 3 },
    );

    jest
      .spyOn(NormandyAPI.prototype, "fetchRecipePage")
      .mockImplementation(() => Promise.resolve(pageResponse));
    jest
      .spyOn(NormandyAPI.prototype, "fetchFilters")
      .mockImplementation(() => Promise.resolve(filtersResponse));
    jest
      .spyOn(NormandyAPI.prototype, "fetchAllActions")
      .mockImplementation(() =>
        Promise.resolve([
          { id: 1, name: "show-heartbeat" },
          { id: 2, name: "opt-out-study" },
          { id: 3, name: "preference-experiment" },
          { id: 4, name: "console-log" },
        ]),
      );

    jest
      .spyOn(NormandyAPI.prototype, "saveRecipe")
      .mockResolvedValue(recipeFactory.build());

    jest
      .spyOn(NormandyAPI.prototype, "fetchRecipe")
      .mockImplementation(() => Promise.resolve(recipes[0]));

    jest.spyOn(ExperimenterAPI.prototype, "fetchExperiment").mockResolvedValue(
      experimenterResponseFactory.build({
        public_description: "",
        variants: [],
      }),
    );
  };

  const extensionSetup = (): Array<Extension> => {
    const extensions = extensionFactory.buildCount(3);

    jest
      .spyOn(NormandyAPI.prototype, "fetchAllExtensions")
      .mockImplementation(() => Promise.resolve(extensions));

    return extensions;
  };

  const consoleLogRecipeSetup = (): RecipeV3 => {
    const versions = versionFoFactory.build({}, { generateVersionsCount: 2 });
    const channels = channelFoFactory.build({}, { generateChannelsCount: 1 });
    const sample = bucketSampleFoFactory.build();
    const filterObject = [versions, sample, channels];
    return recipeFactory.build(
      {},
      {
        actionName: "console-log",
        filterObject,
      },
    );
  };

  const branchedAddonSetup = (): RecipeV3 => {
    const channels = channelFoFactory.build({}, { generateChannelsCount: 1 });
    const filter_object = [channels];
    const branches = addonStudyBranchFactory.buildCount(2);
    return recipeFactory.build({
      latest_revision: {
        action: { name: "branched-addon-study" },
        arguments: { branches },
        filter_object,
      },
    });
  };

  it("creation pref recipe form", async () => {
    setup();
    const { getByText, getAllByRole } = renderWithContext(<RecipeFormPage />);
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
    fireEvent.click(getByText("global-v4", { exact: false }));

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

    await waitFor(() =>
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
          { input: ['"global-v4"'], rate: 0.05, type: "stableSample" },
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
      }),
    );
  }, /* timeout = */ 10_000);

  it("edit recipe form", async () => {
    const recipeData = branchedAddonSetup();
    const extensions = extensionSetup();
    setup(recipeData);
    const doc = renderWithContext(<RecipeFormPage />, {
      route: `/prod/recipes/${recipeData.id}/edit`,
      path: "/prod/recipes/:recipeId/edit",
    });

    await waitFor(() => {
      expect(doc.getByText("Experimenter Slug")).toBeInTheDocument();
    });

    let formGroups = doc.getAllByRole("group");

    const { nameForm, experimenterSlugForm, channelForm } = getForms(
      formGroups,
    );

    const nameInput = nameForm.querySelector("input");
    const experimenterSlugInput = experimenterSlugForm.querySelector("input");

    const name = "A new Recipe Name";
    const experimenter_slug = "the-new-experimenter-slug";

    fireEvent.change(nameInput, { target: { value: name } });
    fireEvent.change(experimenterSlugInput, {
      target: { value: experimenter_slug },
    });

    const all_channels = ["Nightly", "Developer Edition", "Beta", "Release"];
    for (const channel of all_channels) {
      fireEvent.click(within(channelForm).getByText(channel));
    }

    formGroups = doc.getAllByRole("group");
    let branches = findForm(formGroups, "Branches");

    let branchButtons = branches.querySelectorAll("button");
    const firstDeleteButton = branchButtons[0];
    fireEvent.click(firstDeleteButton);

    formGroups = doc.getAllByRole("group");
    branches = findForm(formGroups, "Branches");

    branchButtons = branches.querySelectorAll("button");
    const secondBranchButton = branchButtons[0];

    fireEvent.click(secondBranchButton);

    fireEvent.click(doc.getByText("Add Branch"));

    formGroups = doc.getAllByRole("group");
    branches = findForm(formGroups, "Branches");
    const branchGroups = within(branches).getAllByRole("group");
    const slugForm = findForm(branchGroups, "Slug");
    const ratioForm = findForm(branchGroups, "Ratio");
    const extensionForm = findForm(branchGroups, "Extension");

    const slugInput = slugForm.querySelector("input");
    const ratioInput = ratioForm.querySelector("input");
    const extensionInput = within(extensionForm).getByRole("combobox");

    const slug = "addon-slug";
    const ratio = 25;
    const selectedExtension = extensions[1];

    fireEvent.change(slugInput, { target: { value: slug } });
    fireEvent.change(ratioInput, { target: { value: ratio } });
    fireEvent.click(extensionInput);
    fireEvent.click(doc.getByText(selectedExtension.name));

    fireEvent.click(doc.getByText("Save"));

    const modalDialog = doc.getAllByRole("dialog")[0];
    const commentInput = modalDialog.querySelector("textArea");
    const saveMessage = "Edited Recipe";
    fireEvent.change(commentInput, { target: { value: saveMessage } });

    fireEvent.click(within(modalDialog).getByText("Save"));

    const channelValues = ["nightly", "aurora", "beta", "release"];

    const rev = recipeData.latest_revision;
    const updatedRecipeData: RevisionForPost = {
      ..._.omit(rev, "action"),
      action_id: rev.action.id,
      experimenter_slug,
      name,
      comment: saveMessage,
      arguments: {
        ...rev.arguments,
        branches: [{ slug, ratio, extensionApiId: selectedExtension.id }],
      },
      filter_object: rev.filter_object.map((fo) => {
        if (fo.type === "channel") {
          return {
            ...fo,
            channels: channelValues.filter((c) => !fo.channels.includes(c)),
          };
        }

        return fo;
      }),
    };

    await waitFor(() =>
      expect(NormandyAPI.prototype.saveRecipe).toBeCalledWith(
        recipeData.id.toString(),
        updatedRecipeData,
      ),
    );
  });

  it("server errors are shown in along the fields", async () => {
    const recipeData = consoleLogRecipeSetup();
    await setup(recipeData);

    jest.spyOn(NormandyAPI.prototype, "saveRecipe").mockRejectedValue({
      data: {
        status: 400,
        action_id: ["Bad action"],
        experimenter_slug: ["Wrong slug"],
        arguments: {
          message: ["Bad message"],
        },
      },
    });

    const doc = renderWithContext(<RecipeFormPage />, {
      route: `/prod/recipes/${recipeData.id}/edit`,
      path: "/prod/recipes/:recipeId/edit",
    });

    await waitFor(() => {
      expect(doc.getByText("Experimenter Slug")).toBeInTheDocument();
    });

    fireEvent.click(doc.getByText("Save"));

    const modalDialog = doc.getAllByRole("dialog")[0];
    const commentInput = modalDialog.querySelector("textArea");
    const saveMessage = "Form with error";
    fireEvent.change(commentInput, { target: { value: saveMessage } });

    fireEvent.click(within(modalDialog).getByText("Save"));

    await waitFor(() => {
      const formGroups = doc.getAllByRole("group");
      const { actionForm, experimenterSlugForm } = getForms(formGroups);
      expect(actionForm.querySelector(".text-red")).toBeInTheDocument();
      expect(
        experimenterSlugForm.querySelector(".text-red"),
      ).toBeInTheDocument();

      const messageForm = findForm(formGroups, "Message");
      expect(messageForm.querySelector(".text-red")).toBeInTheDocument();
    });
  });

  it("save button is re-enabled when form errors are addressed", async () => {
    const recipeData = consoleLogRecipeSetup();
    await setup(recipeData);
    const doc = renderWithContext(<RecipeFormPage />, {
      route: `/prod/recipes/${recipeData.id}/edit`,
      path: "/prod/recipes/:recipeId/edit",
    });

    await waitFor(() => {
      expect(doc.getByText("Experimenter Slug")).toBeInTheDocument();
    });

    const formGroups = doc.getAllByRole("group");
    const { fallbackFOForm } = getForms(formGroups);

    const saveButton = doc.getByText("Save");
    expect(saveButton).not.toHaveAttribute("disabled");

    const foCodeBlock = fallbackFOForm.querySelector("textarea");

    // Technically this should be a more specific ClipboardEvent, but JSDom
    // doesn't really like that, so fake it and tell TypeScript that it's fine.
    const clipboardEvent = new Event("paste", {
      bubbles: true,
      cancelable: true,
      composed: true,
    }) as ClipboardEvent;
    // clipboardData is supposed to be readonly. Lie to TypeScript so we can
    // update it on our mock event.
    ((clipboardEvent as unknown) as {
      clipboardData: { getData: () => string };
    }).clipboardData = {
      getData: () => "invalid json!",
    };

    foCodeBlock.dispatchEvent(clipboardEvent);

    expect(doc.getByText("[]invalid json!")).toBeInTheDocument();
    expect(
      doc.getByText("Filter Object(s) is not valid JSON"),
    ).toBeInTheDocument();
    expect(
      doc.getByText("Filter Object(s) is not contained in an array"),
    ).toBeInTheDocument();
    expect(saveButton).toHaveAttribute("disabled");

    // undo the paste
    foCodeBlock.dispatchEvent(new Event("focus"));
    foCodeBlock.dispatchEvent(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      new KeyboardEvent("keydown", { keyCode: 90, ctrlKey: true }),
    );

    expect(doc.getByText("[]")).toBeInTheDocument();
    expect(saveButton).not.toHaveAttribute("disabled");

    fireEvent.click(saveButton);

    const modalDialog = doc.getAllByRole("dialog")[0];
    const commentInput = modalDialog.querySelector("textArea");
    const saveMessage = "Edited Recipe";
    fireEvent.change(commentInput, { target: { value: saveMessage } });

    fireEvent.click(within(modalDialog).getByText("Save"));

    const updatedRecipeData: RevisionForPost = {
      ..._.omit(recipeData.latest_revision, "action"),
      comment: saveMessage,
      action_id: recipeData.latest_revision.action.id,
    };

    await waitFor(() =>
      expect(NormandyAPI.prototype.saveRecipe).toBeCalledWith(
        recipeData.id.toString(),
        updatedRecipeData,
      ),
    );
  });

  it("should have isEnrollmentPaused set when import from experimenter", async () => {
    const versions = versionFoFactory.build({}, { generateVersionsCount: 2 });
    const branches = multiPrefBranchFactory.buildCount(2);
    const recipe = recipeFactory.build({
      latest_revision: {
        action: { name: "multi-preference-experiment" },
        arguments: { branches },
        filter_object: [versions],
      },
    }) as RecipeV3<MultiPreferenceExperimentArguments>;

    setup(recipe);

    const experimenterRecipe = {
      ..._.omit(recipe.latest_revision, "action"),
      action_name: recipe.latest_revision.action.name,
      comment: "",
    } as ExperimenterRecipePreview<MultiPreferenceExperimentArguments>;

    jest
      .spyOn(ExperimenterAPI.prototype, "fetchRecipe")
      .mockImplementation(() => Promise.resolve(experimenterRecipe));

    jest
      .spyOn(NormandyAPI.prototype, "fetchAllActions")
      .mockImplementation(() =>
        Promise.resolve([recipe.latest_revision.action]),
      );

    const doc = await renderWithContext(<RecipeFormPage />, {
      route: "/prod/recipes/import/experimenter-slug",
      path: "/prod/recipes/import/:experimenterSlug",
    });
    await waitFor(() =>
      expect(ExperimenterAPI.prototype.fetchRecipe).toHaveBeenCalled(),
    );

    await waitFor(() => {
      expect(doc.getByText("Experimenter Slug")).toBeInTheDocument();
    });

    const formGroups = doc.getAllByRole("group");
    const highVolumeForm = findForm(formGroups, "High Volume Recipe");
    const highVolumeToggle = within(highVolumeForm).getByRole("button");

    fireEvent.click(highVolumeToggle);
    fireEvent.click(doc.getByText("Save"));

    const modalDialog = doc.getAllByRole("dialog")[0];
    const commentInput = modalDialog.querySelector("textArea");
    userEvent.type(commentInput, "Edited Recipe");

    fireEvent.click(within(modalDialog).getByText("Save"));

    const expectedRecipeData: RevisionForPost<MultiPreferenceExperimentArguments> = {
      ..._.omit(recipe.latest_revision, "action"),
      action_id: recipe.latest_revision.action.id,
      comment: "Edited Recipe",
    };
    expectedRecipeData.arguments.isHighPopulation = true;
    expectedRecipeData.arguments.isEnrollmentPaused = false;

    await waitFor(() =>
      expect(NormandyAPI.prototype.saveRecipe).toBeCalledWith(
        undefined,
        expectedRecipeData,
      ),
    );
  });

  it("create show heart beat recipe", async () => {
    setup();

    const { getByText, getAllByRole } = renderWithContext(<RecipeFormPage />);

    await waitFor(() =>
      expect(getByText("Experimenter Slug")).toBeInTheDocument(),
    );
    let formGroups = getAllByRole("group");

    const {
      nameForm,
      experimenterSlugForm,
      channelForm,
      actionForm,
    } = getForms(formGroups);

    const nameInput = nameForm.querySelector("input");
    const experimenterSlugInput = experimenterSlugForm.querySelector("input");

    fireEvent.change(nameInput, { target: { value: "Recipe Name" } });
    fireEvent.change(experimenterSlugInput, {
      target: { value: "the-experimenter-slug" },
    });

    fireEvent.click(within(channelForm).getByText("Release"));

    const actionInput = within(actionForm).getByRole("combobox");
    expect(NormandyAPI.prototype.fetchAllActions).toHaveBeenCalled();
    fireEvent.click(actionInput);
    fireEvent.click(getByText("show-heartbeat"));

    formGroups = getAllByRole("group");
    const {
      surveyIDForm,
      engagementButtonForm,
      messageForm,
      thanksMessageForm,
      learnMessageForm,
      learnMoreUrlForm,
      postAnswerURLForm,
      promptForm,
      includeTelemetryForm,
    } = getHeartBeatFields(formGroups);

    const surveyIDInput = surveyIDForm.querySelector("input");
    const engagementInput = engagementButtonForm.querySelector("input");
    const messageInput = messageForm.querySelector("input");
    const thanksMessageInput = thanksMessageForm.querySelector("input");
    const learnMessageInput = learnMessageForm.querySelector("input");
    const learnMoreUrlInput = learnMoreUrlForm.querySelector("input");
    const postAnswerURLInput = postAnswerURLForm.querySelector("input");
    const promptInput = within(promptForm).getByRole("combobox");
    const includeTelemetryToggle = within(includeTelemetryForm).getByRole(
      "button",
    );

    const surveyId = "survey-id";
    const engagementButton = "take survey";
    const message = "it's the message of the survey!";
    const thanksMessage = "thank you!";
    const learnMessage = "learn more";
    const learnMoreUrl = "https://example.com/learnmore";
    const postAnswerUrl = "https://example.com";

    fireEvent.change(surveyIDInput, { target: { value: surveyId } });
    fireEvent.change(engagementInput, { target: { value: engagementButton } });
    fireEvent.change(messageInput, { target: { value: message } });
    fireEvent.change(thanksMessageInput, { target: { value: thanksMessage } });
    fireEvent.change(learnMessageInput, { target: { value: learnMessage } });
    fireEvent.change(learnMoreUrlInput, { target: { value: learnMoreUrl } });
    fireEvent.change(postAnswerURLInput, { target: { value: postAnswerUrl } });

    fireEvent.click(promptInput);
    fireEvent.click(getByText("Show users every X days."));
    expect(getByText("Days before user is reprompted")).toBeInTheDocument();

    formGroups = getAllByRole("group");
    const repromptForm = findForm(formGroups, "Days before user is reprompted");
    const repromptInput = repromptForm.querySelector("input");
    fireEvent.change(repromptInput, { target: { value: 4 } });

    fireEvent.click(includeTelemetryToggle);

    getByText("Save");
    fireEvent.click(getByText("Save"));

    const modalDialog = getAllByRole("dialog")[0];
    const commentInput = modalDialog.querySelector("textArea");
    const saveMessage = "Created Recipe";
    fireEvent.change(commentInput, { target: { value: saveMessage } });

    fireEvent.click(within(modalDialog).getByText("Save"));

    await waitFor(() =>
      expect(NormandyAPI.prototype.saveRecipe).toBeCalledWith(undefined, {
        action_id: 1,
        arguments: {
          learnMoreUrl,
          message,
          postAnswerUrl,
          surveyId,
          thanksMessage,
          engagementButtonLabel: engagementButton,
          includeTelemetryUUID: true,
          learnMoreMessage: learnMessage,
          repeatEvery: 4,
          repeatOption: "xdays",
        },
        comment: "Created Recipe",
        experimenter_slug: "the-experimenter-slug",
        filter_object: [{ channels: ["release"], type: "channel" }],
        name: "Recipe Name",
      }),
    );
  });

  it("creation addon recipe form", async () => {
    setup();
    const extensions = extensionSetup();

    const doc = renderWithContext(<RecipeFormPage />, {
      path: "/prod/recipes/new",
      route: `/prod/recipes/new`,
    });

    await waitFor(() =>
      expect(doc.getByText("Experimenter Slug")).toBeInTheDocument(),
    );
    let formGroups = doc.getAllByRole("group");

    const {
      nameForm,
      experimenterSlugForm,
      channelForm,
      actionForm,
    } = getForms(formGroups);

    const nameInput = nameForm.querySelector("input");
    const experimenterSlugInput = experimenterSlugForm.querySelector("input");

    fireEvent.change(nameInput, { target: { value: "Recipe Name" } });
    fireEvent.change(experimenterSlugInput, {
      target: { value: "the-experimenter-slug" },
    });

    fireEvent.click(within(channelForm).getByText("Release"));

    const actionInput = within(actionForm).getByRole("combobox");
    expect(NormandyAPI.prototype.fetchAllActions).toHaveBeenCalled();
    fireEvent.click(actionInput);
    fireEvent.click(doc.getByText("opt-out-study"));
    fireEvent.click(document);

    await waitFor(() =>
      expect(NormandyAPI.prototype.fetchAllExtensions).toReturn(),
    );

    formGroups = doc.getAllByRole("group");
    const {
      studyNameForm,
      studyDescriptionForm,
      extensionForm,
      preventNewEnrollmentForm,
    } = getAddonFields(formGroups);

    const studyNameInput = studyNameForm.querySelector("input");
    const studyDescriptionInput = studyDescriptionForm.querySelector(
      "textarea",
    );
    const extensionInput = within(extensionForm).getByRole("combobox");
    const preventNewEnrollmentToggle = within(
      preventNewEnrollmentForm,
    ).getByRole("button");

    const studyName = "Addon Study Name";
    const studyDescription =
      "This is the description of the addon study description";
    const selectedExtension = extensions[0];
    fireEvent.change(studyNameInput, { target: { value: studyName } });
    fireEvent.change(studyDescriptionInput, {
      target: { value: studyDescription },
    });

    fireEvent.click(extensionInput);
    expect(doc.getByText(selectedExtension.name)).toBeInTheDocument();
    fireEvent.click(doc.getByText(selectedExtension.name));
    fireEvent.click(preventNewEnrollmentToggle);

    doc.getByText("Save");
    fireEvent.click(doc.getByText("Save"));

    const modalDialog = doc.getAllByRole("dialog")[0];
    const commentInput = modalDialog.querySelector("textArea");
    const saveMessage = "Created Recipe";
    fireEvent.change(commentInput, { target: { value: saveMessage } });

    fireEvent.click(within(modalDialog).getByText("Save"));

    await waitFor(() =>
      expect(NormandyAPI.prototype.saveRecipe).toBeCalledWith(undefined, {
        action_id: 2,
        arguments: {
          addonUrl: selectedExtension.xpi,
          description: "This is the description of the addon study description",
          extensionApiId: selectedExtension.id,
          isEnrollmentPaused: true,
          name: "Addon Study Name",
        },
        comment: "Created Recipe",
        experimenter_slug: "the-experimenter-slug",
        filter_object: [{ channels: ["release"], type: "channel" }],
        name: "Recipe Name",
      }),
    );
  });

  it("fallback editor is rendered for unknown action types", async () => {
    const recipeData = recipeFactory.build({
      latest_revision: { action: { name: "unknown" } },
    });
    setup(recipeData);
    const doc = renderWithContext(<RecipeFormPage />, {
      path: "/prod/recipe/edit/:recipeId",
      route: `/prod/recipe/edit/${recipeData.id}`,
    });
    await waitFor(() => {
      expect(doc.getByText("Experimenter Slug")).toBeInTheDocument();
    });

    const argumentSection = doc.getByTestId("recipe-form-argument-editor");
    expect(
      await within(argumentSection).findByText("Action Arguments"),
    ).toBeInTheDocument();
  });
});
