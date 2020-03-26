import React from "react";
import { HashRouter } from "react-router-dom";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { WebAuth } from "auth0-js";

import AppHeader from "devtools/components/common/AppHeader";
import { GlobalStateProvider } from "devtools/contexts/globalState";

// This component uses the global context and location so wrap it in the required providers.
function WrappedAppHeader() {
  return (
    <HashRouter>
      <GlobalStateProvider>
        <AppHeader />
      </GlobalStateProvider>
    </HashRouter>
  );
}

describe("`AppHeader`", () => {
  it("should start the authentication flow when the login button is clicked", async () => {
    const spyLaunchWebAuthFlow = jest.spyOn(
      browser.identity,
      "launchWebAuthFlow",
    );
    jest.spyOn(WebAuth.prototype, "parseHash").mockImplementation(() => {});
    const { getByText } = await render(<WrappedAppHeader />);
    const loginButton = getByText("Log In");
    fireEvent.click(loginButton);
    expect(spyLaunchWebAuthFlow).toBeCalled();
  });
});
