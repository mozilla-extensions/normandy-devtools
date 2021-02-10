import { renderHook, act } from "@testing-library/react-hooks";
import React from "react";
import { MemoryRouter, useHistory } from "react-router";

import {
  EnvironmentProvider,
  useSelectedExperimenterEnvironmentAPI,
  useSelectedNormandyEnvironmentAPI,
} from "devtools/contexts/environment";
import ExperimenterAPI from "devtools/utils/experimenterApi";
import NormandyAPI from "devtools/utils/normandyApi";

describe("environment context", () => {
  describe("useSelectedNormandyEnvironmentAPI", () => {
    it("should be equal on repeated calls with the same environment", async () => {
      const wrapper: React.FC = ({ children }) => (
        <MemoryRouter>
          <EnvironmentProvider>{children}</EnvironmentProvider>
        </MemoryRouter>
      );

      // Setup
      const { result, waitFor } = renderHook(
        () => ({
          history: useHistory(),
          normandyApi: useSelectedNormandyEnvironmentAPI(),
        }),
        { wrapper },
      );
      act(() => result.current.history.push("/prod/recipes"));
      await waitFor(
        () => result.current.normandyApi.environment.key === "prod",
      );
      const originalApi: NormandyAPI = result.current.normandyApi;

      // The API returned should be the same object if we re-render the hook.
      expect(result.current.normandyApi).toBe(originalApi);

      // After switching to a new environment, the result should be distinct from the previous ones.
      act(() => result.current.history.push("/stage/recipes"));
      await waitFor(
        () => result.current.normandyApi.environment.key === "stage",
      );
      expect(result.current.normandyApi).not.toBe(originalApi);
    });
  });

  describe("useSelectedExperimenterEnvironmentAPI", () => {
    it("should be equal on repeated calls with the same environment", async () => {
      const wrapper: React.FC = ({ children }) => (
        <MemoryRouter>
          <EnvironmentProvider>{children}</EnvironmentProvider>
        </MemoryRouter>
      );

      // Setup
      const { result, waitFor } = renderHook(
        () => ({
          history: useHistory(),
          experimenterApi: useSelectedExperimenterEnvironmentAPI(),
        }),
        { wrapper },
      );
      result.current.history.push("/prod/recipes");
      await waitFor(
        () => result.current.experimenterApi.environment.key === "prod",
      );
      const originalApi: ExperimenterAPI = result.current.experimenterApi;

      // The API returned should be the same object if we re-render the hook.
      expect(result.current.experimenterApi).toBe(originalApi);

      // After switching to a new environment, the result should be distinct from the previous ones.
      result.current.history.push("/stage/recipes");
      await waitFor(
        () => result.current.experimenterApi.environment.key === "stage",
      );
      expect(result.current.experimenterApi).not.toBe(originalApi);
    });
  });
});
