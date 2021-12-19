import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { MemoryRouter } from "react-router";

import RecipeQueryEditor, {
  convertDraftToQuery,
  getRecipeQueryFromUrlSearch,
} from "devtools/components/recipes/listings/RecipeQueryEditor";
import { actionFactory } from "devtools/tests/factories/api";
import { environmentFactory } from "devtools/tests/factories/state";
import { Action } from "devtools/types/normandyApi";
import NormandyAPI from "devtools/utils/normandyApi";

describe("RecipeQueryEditor", () => {
  let actions: Array<Action>;
  let api: NormandyAPI;

  beforeEach(() => {
    jest.useFakeTimers("modern");
    // use-debounce tries to use requestAnimationFrame if it is available,
    // requestAnimationFrame is not hooked by Jest's fake timers. Setting it to
    // undefined makes the debounce library fall back to setTimeout.
    window.requestAnimationFrame = undefined;

    api = new NormandyAPI(environmentFactory.build(), null, false);
    actions = actionFactory.buildCount(4);
    jest.spyOn(api, "fetchAllActions").mockResolvedValue(actions);
  });

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should render", () => {
    const doc = render(
      <MemoryRouter>
        {/* eslint-disable-next-line @typescript-eslint/no-empty-function */}
        <RecipeQueryEditor normandyApi={api} query={{}} setQuery={() => {}} />,
      </MemoryRouter>,
    );

    expect(doc.getByText("Search")).toBeInTheDocument();
  });

  it("should call setQuery debounced when changes happen", async () => {
    const setQuery = jest.fn();
    const doc = render(
      <MemoryRouter>
        <RecipeQueryEditor normandyApi={api} query={{}} setQuery={setQuery} />,
      </MemoryRouter>,
    );

    const searchInput = doc.getByTestId("filter-field-search");
    // type twice in quick succession to test debouncing
    userEvent.type(searchInput, "poc");
    userEvent.type(searchInput, "ket");

    // debounce hasn't ended yet
    expect(setQuery).not.toBeCalled();

    jest.advanceTimersByTime(500);
    expect(setQuery).toBeCalledWith({ text: "pocket" });
    expect(setQuery).toBeCalledTimes(1);
  });

  it("should update the URL immediately when changes happen", () => {
    const doc = render(
      <MemoryRouter>
        {/* eslint-disable-next-line @typescript-eslint/no-empty-function */}
        <RecipeQueryEditor normandyApi={api} query={{}} setQuery={() => {}} />,
      </MemoryRouter>,
    );

    const searchInput = doc.getByTestId("filter-field-search");
    userEvent.type(searchInput, "etp");
  });
});

describe("getRecipeQueryFromUrlSearch", () => {
  beforeEach(() => {
    jest.spyOn(console, "warn");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should handle a complex query", () => {
    const qs = "page=2&enabled=true&action=console-log&text=pocket";
    expect(getRecipeQueryFromUrlSearch(qs)).toEqual({
      page: 2,
      enabled: true,
      action: "console-log",
      text: "pocket",
    });

    expect(console.warn).not.toBeCalled();
  });

  describe("enabled field", () => {
    it("should convert to a boolean", () => {
      let query = getRecipeQueryFromUrlSearch("enabled=true");
      expect(typeof query.enabled).toBe("boolean");
      query = getRecipeQueryFromUrlSearch("enabled=false");
      expect(typeof query.enabled).toBe("boolean");

      expect(console.warn).not.toBeCalled();
    });

    it("should not set the field if the value is non-boolean", () => {
      const query = getRecipeQueryFromUrlSearch("enabled=maybe");
      expect(query.enabled).not.toBeDefined();

      expect(console.warn).toBeCalledWith("enabled is not a boolean");
    });
  });

  describe("page field", () => {
    it("should convert to a number", () => {
      const query = getRecipeQueryFromUrlSearch("page=10");
      expect(typeof query.page).toBe("number");
      expect(query.page).toBe(10);

      expect(console.warn).not.toBeCalled();
    });

    it("should not set the field if the value is not a number", () => {
      const query = getRecipeQueryFromUrlSearch("page=next");
      expect(query.page).not.toBeDefined();
      expect(console.warn).toBeCalledWith("page is not a number");
    });

    it("should not set the field for page 1", () => {
      const query = getRecipeQueryFromUrlSearch("page=1");
      expect(query.page).not.toBeDefined();

      expect(console.warn).not.toBeCalled();
    });
  });
});

describe("convertDraftToQuery", () => {
  it("removes null and undefined values", () => {
    const query = convertDraftToQuery({
      enabled: null,
      text: undefined,
      action: "console-log",
    });
    expect(query).toEqual({ action: "console-log" });
  });

  it("removes page=1", () => {
    const query = convertDraftToQuery({ page: 1, text: "etp" });
    expect(query).toEqual({ text: "etp" });
  });
});
