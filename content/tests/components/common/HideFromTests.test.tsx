import { render } from "@testing-library/react";
import React from "react";

import { HideFromTests } from "devtools/components/common/HideFromTests";

describe("HideFromTests", () => {
  it("should hide it's children", async () => {
    const { queryByText } = render(
      <HideFromTests>
        <div>SHOW ME!</div>
      </HideFromTests>,
    );
    expect(queryByText("SHOW ME!")).toBeNull();
  });
});
