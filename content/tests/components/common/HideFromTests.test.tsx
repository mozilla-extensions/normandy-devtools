import { cleanup, render } from "@testing-library/react";
import React from "react";

import { HideFromTests } from "devtools/components/common/HideFromTests";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      __TESTING__: boolean;
    }
  }
}

describe("HideFromTests", () => {
  afterEach(async () => {
    global.__TESTING__ = true;
    await cleanup();
  });

  it("show not hide it's children when testing", () => {
    global.__TESTING__ = false;
    const { getByText } = render(
      <HideFromTests>
        <div>SHOW ME!</div>
      </HideFromTests>,
    );
    expect(getByText("SHOW ME!")).toBeInTheDocument();
  });

  it("should hide it's children when testing", () => {
    const { queryByText } = render(
      <HideFromTests>
        <div>SHOW ME!</div>
      </HideFromTests>,
    );
    expect(queryByText("SHOW ME!")).toBeNull();
  });
});
