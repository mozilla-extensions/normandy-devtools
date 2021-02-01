import { cleanup, fireEvent, render } from "@testing-library/react";
import React from "react";

import ActionSelector from "devtools/components/common/ActionSelector";
import { actionFactory } from "devtools/tests/factories/api";
import { environmentFactory } from "devtools/tests/factories/state";
import NormandyAPI from "devtools/utils/normandyApi";

describe("ActionSelector", () => {
  const actions = actionFactory.buildCount(4);
  const api = new NormandyAPI(environmentFactory.build(), null, false);

  beforeEach(() => {
    restoreConsole();
    jest
      .spyOn(NormandyAPI.prototype, "fetchAllActions")
      .mockResolvedValue(actions);
  });

  afterEach(() => {
    modifyConsole();
    jest.clearAllMocks();
    cleanup();
  });

  it("should be renderable", async () => {
    const doc = render(<ActionSelector normandyApi={api} value={null} />);
    fireEvent.click(doc.getByRole("combobox"));
    for (const action of actions) {
      expect(await doc.findByText(action.name)).toBeInTheDocument();
    }
  });

  it("should fire change events", async () => {
    const handleActionChange = jest.fn();
    const handleNameChange = jest.fn();

    const doc = render(
      <ActionSelector
        normandyApi={api}
        value={null}
        onChangeAction={handleActionChange}
        onChangeName={handleNameChange}
      />,
    );
    fireEvent.click(doc.getByRole("combobox"));
    fireEvent.click(await doc.findByText(actions[0].name));

    expect(handleActionChange).toBeCalledWith(actions[0]);
    expect(handleNameChange).toBeCalledWith(actions[0].name);
  });
});
