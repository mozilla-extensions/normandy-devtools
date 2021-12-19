import { cleanup, waitFor, within } from "@testing-library/react";
import React from "react";

import ExtensionsPage from "devtools/components/pages/ExtensionsPage";
import { extensionFactory } from "devtools/tests/factories/api";
import { Extension } from "devtools/types/normandyApi";
import { Deferred } from "devtools/utils/helpers";
import NormandyAPI, { ApiPage } from "devtools/utils/normandyApi";

afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
  cleanup();
});

describe("ExtensionPage", () => {
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
});
