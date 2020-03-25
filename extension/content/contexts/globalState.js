import PropTypes from "prop-types";
import React, { createContext, useReducer } from "react";

import { DEFAULT_ENV } from "devtools/config";
import environmentStore from "devtools/utils/environmentStore";

const initialState = {
  selectedEnvironment: environmentStore.get(DEFAULT_ENV),
};
export const globalStateContext = createContext(initialState);
const { Provider } = globalStateContext;

export const ACTION_SELECT_ENVIRONMENT = "SELECT_ENVIRONMENT";

const reducer = (state, action) => {
  switch (action.type) {
    case ACTION_SELECT_ENVIRONMENT:
      return {
        ...state,
        selectedEnvironment: environmentStore.get(action.environment),
      };

    default:
      return state;
  }
};

export function GlobalStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  React.useEffect(() => {
    Object.values(environmentStore.getAll()).forEach(e => {
      e.authSession.registerHandler("login", () => {
        dispatch(ACTION_SELECT_ENVIRONMENT, state.selectedEnvironment.key);
      });
      e.authSession.registerHandler("logout", () => {
        dispatch(ACTION_SELECT_ENVIRONMENT, state.selectedEnvironment.key);
      });
    });
  }, []);
  return <Provider value={{ state, dispatch }}>{children}</Provider>;
}

GlobalStateProvider.propTypes = {
  children: PropTypes.any,
};
