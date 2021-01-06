import { cleanup, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import ExtensionsPage, {
  UploadPopover,
} from "devtools/components/pages/ExtensionsPage";
import { extensionFactory } from "devtools/tests/factories/api";
import { Extension } from "devtools/types/normandyApi";
import { Deferred } from "devtools/utils/helpers";
import NormandyAPI, { ApiPage } from "devtools/utils/normandyApi";

let extensions: Array<Extension>;
const pageSize = 10;

beforeEach(() => {
  extensions = extensionFactory.buildCount(30);

  jest
    .spyOn(NormandyAPI.prototype, "fetchExtensionsPage")
    .mockImplementation(async ({ page }) => {
      const start = (page - 1) * pageSize;
      const end = page * pageSize;
      const extensionPage = extensions.slice(start, end);
      return {
        count: extensionPage.length,
        next: end < extensions.length ? `?page=${page + 1}` : null,
        previous: page > 1 ? `?page=${page - 1}` : null,
        results: extensionPage,
      };
    });
});

afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  cleanup();
});

describe("ExtensionPage", () => {
  it("should show a list of extensions", async () => {
    expect(extensions.length).toBeGreaterThanOrEqual(pageSize);

    const doc = renderWithContext(<ExtensionsPage />);
    await waitFor(() => doc.findByTestId("extensions-list"));
    const extensionsList = await doc.getByTestId("extensions-list");
    const cards = extensionsList.querySelectorAll(".extension-card");
    expect(cards).toHaveLength(pageSize);
    for (let i = 0; i < pageSize; i++) {
      expect(
        within(cards[i] as HTMLElement).getByText(`${extensions[i].id}`),
      ).toBeInTheDocument();
      expect(
        within(cards[i] as HTMLElement).getByText(extensions[i].name),
      ).toBeInTheDocument();
    }
  });

  it("should show a loading message", async () => {
    const extensionPageDeferred: Deferred<ApiPage<Extension>> = new Deferred();
    jest
      .spyOn(NormandyAPI.prototype, "fetchExtensionsPage")
      .mockResolvedValue(extensionPageDeferred.promise);
    const doc = renderWithContext(<ExtensionsPage />);
    expect(await doc.findByText(/^Loading/)).toBeInTheDocument();

    extensionPageDeferred.resolve({
      count: 10,
      next: null,
      previous: null,
      results: extensions.slice(0, 10),
    });
    await waitFor(() => expect(doc.queryByText(/^Loading/)).toBeNull());
  });

  it("should show errors", async () => {
    const errorMessage = "This is a test.";
    jest
      .spyOn(NormandyAPI.prototype, "fetchExtensionsPage")
      .mockRejectedValue(new Error(errorMessage));

    const doc = renderWithContext(<ExtensionsPage />);
    expect(
      await doc.findByText(errorMessage, { exact: false }),
    ).toBeInTheDocument();
  });

  it("should open the upload dialog when the upload button is clicked", async () => {
    const doc = renderWithContext(<ExtensionsPage />);
    const uploadButton = await doc.findByText("Upload Extension");
    expect(doc.queryAllByTestId("extension-upload-dialog").length).toBe(0);
    userEvent.click(uploadButton);
    expect(
      await doc.findByTestId("extension-upload-dialog"),
    ).toBeInTheDocument();
  });
});

describe("UploadPopover", () => {
  beforeEach(() => {
    jest.useFakeTimers("modern");
  });

  it("should allow submissions", async () => {
    const closeFunc = jest.fn();
    const createExtensionDeferred = new Deferred<Extension>();
    const createExtensionSpy = jest
      .spyOn(NormandyAPI.prototype, "createExtension")
      .mockReturnValue(createExtensionDeferred.promise);

    const doc = renderWithContext(<UploadPopover toClose={closeFunc} />);

    const fileName = "fake-extension.xpi";
    const extensionName = "Fake Extension v1.2.3";
    const file = new File(["fakexpi"], fileName, {
      type: "application/zip",
    });

    // The input is rather hidden, so go through some special effort to find it
    const uploadButton = doc.getByLabelText("XPI", { selector: "button" });
    const uploadInput = uploadButton.parentElement.querySelector("input");
    userEvent.upload(uploadInput, file);
    expect(await doc.findByText(fileName)).toBeInTheDocument();

    // Set the name
    const nameField = doc.getByLabelText("Name");
    userEvent.type(nameField, extensionName);

    // Submit!
    const submitButton = doc.getByText("Submit");
    userEvent.click(submitButton);

    // The UI should show that submission is being processed
    expect(doc.baseElement.querySelector("form")).toHaveAttribute("disabled");
    expect(submitButton).toHaveClass("rs-btn-loading");
    expect(createExtensionSpy).toHaveBeenCalledWith({
      xpi: file,
      name: extensionName,
    });

    // It should update to "done"
    createExtensionDeferred.resolve(
      extensionFactory.build({ name: extensionName }),
    );
    expect(await doc.findByTitle("Done")).toBeInTheDocument();
    expect(doc.baseElement.querySelector("form")).toHaveAttribute("disabled");

    // And then close a few seconds later
    expect(closeFunc).not.toBeCalled();
    jest.advanceTimersByTime(3000);
    expect(closeFunc).toBeCalled();
  });

  it("should show errors", async () => {
    const errorData = {
      name: ["Name Error 1", "Name Error 2"],
      xpi: ["XPI Error 1", "XPI Error 2"],
    };

    const closeFunc = jest.fn();
    jest
      .spyOn(NormandyAPI.prototype, "createExtension")
      .mockRejectedValue({ data: errorData });

    const doc = renderWithContext(<UploadPopover toClose={closeFunc} />);
    const submitButton = doc.getByText("Submit");
    userEvent.click(submitButton);

    for (const errorText of errorData.name.concat(errorData.xpi)) {
      expect(await doc.findByText(errorText)).toBeInTheDocument;
    }
  });
});
