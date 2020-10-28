import { render, cleanup } from "@testing-library/react";
import React from "react";

import TelemetryLink from "devtools/components/recipes/details/TelemetryLink";

afterEach(async () => {
  jest.clearAllMocks();
  await cleanup();
});

describe("TelemetryLink", () => {
  it("should includes dates for complete experiments", () => {
    const day = 24 * 3600 * 1000;
    const start = new Date(600000000);
    const end = new Date(800000000);

    const doc = render(
      <TelemetryLink
        endDate={end}
        normandySlug="abc"
        startDate={start}
        status="complete"
      />,
    );

    const url = doc.baseElement
      .getElementsByTagName("a")[0]
      .getAttribute("href");

    expect(url).toContain("abc");
    expect(url).toContain(`${600000000 - 1 * day}`);
    expect(url).toContain(`${800000000 + 2 * day}`);
  });
});
