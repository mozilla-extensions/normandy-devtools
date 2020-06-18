import { render, fireEvent, waitFor, cleanup } from "@testing-library/react";
import React from "react";

import { TestingClientId } from "devtools/components/recipes/details/filters/BucketSample";
import { Deferred } from "devtools/utils/helpers";

afterEach(async () => {
  jest.clearAllMocks();
  await cleanup();
});

describe("BucketSample", () => {
  const testFilter = {
    start: 0,
    count: 100,
    total: 10000,
    input: ["normandy.userId", "'global-v2'"],
  };

  it("should have a help icon", async () => {
    const doc = render(<TestingClientId filter={testFilter} />);
    const helpIcon = doc.getByRole("button");
    fireEvent.click(helpIcon);

    const tooltip = await doc.findByRole("tooltip");
    expect(tooltip).toBeDefined();
    expect(tooltip.textContent).toContain("preference");
  });

  it("should show loading and then succeed", async () => {
    // a promise that won't resolve
    const bucketSampleResult = new Deferred();
    browser.experiments.normandy.bucketSample.mockReturnValue(
      bucketSampleResult.promise,
    );

    const doc = render(<TestingClientId filter={testFilter} />);
    const clientId = doc.getByLabelText("Testing clientId");
    expect(clientId.textContent).toMatch(/Loading/);

    bucketSampleResult.resolve(true);
    await waitFor(() => expect(clientId.textContent).toMatch(/test-userId-0/));
  });

  it("should show loading and then show any errors", async () => {
    // a promise that won't resolve
    const bucketSampleResult = new Deferred();
    browser.experiments.normandy.bucketSample.mockReturnValue(
      bucketSampleResult.promise,
    );

    const doc = render(<TestingClientId filter={testFilter} />);
    const clientId = doc.getByLabelText("Testing clientId");
    expect(clientId).toHaveTextContent(/.*Loading.*/);

    bucketSampleResult.reject(new Error("test error"));
    await waitFor(() => expect(clientId.textContent).toMatch(/test error/));
  });

  it("should error on unexpected input formats", async () => {
    const filter = { ...testFilter, input: ["normandy.unexpected"] };
    const doc = render(<TestingClientId filter={filter} />);
    const clientId = doc.getByLabelText("Testing clientId");
    await waitFor(() =>
      expect(clientId.textContent).toMatch(/can only handle inputs/i),
    );
  });
});
