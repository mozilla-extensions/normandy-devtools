import PropTypes from "prop-types";
import React from "react";

export const INITIAL_EXPERIMENTER_DATA = {
  public_description: "",
};

const initialState = {
  data: INITIAL_EXPERIMENTER_DATA,
  clientErrors: {},
};

export const experimenterDetailsContext = React.createContext(initialState);
const { Provider } = experimenterDetailsContext;

export const ACTION_UPDATE_DATA = "UPDATE_DATA";
export const ACTION_UPDATE_CLIENT_ERRORS = "UPDATE_CLIENT_ERRORS";
export const ACTION_REMOVE_CLIENT_ERRORS = "REMOVE_CLIENT_ERRORS";

function reducer(state, action) {
  switch (action.type) {
    case ACTION_UPDATE_DATA:
      return {
        ...state,
        data: action.data,
      };

    case ACTION_UPDATE_CLIENT_ERRORS:
      return {
        ...state,
        clientErrors: {
          ...state.clientErrors,
          [action.name]: action.errors,
        },
      };

    case ACTION_REMOVE_CLIENT_ERRORS:
      const { [action.name]: _omit, ...clientErrors } = state.clientErrors;
      return {
        ...state,
        clientErrors,
      };

    default:
      return state;
  }
}

export function ExperimenterDetailsProvider({ children, data }) {
  /** @type {[React.ReducerState<any>, React.Dispatch<React.ReducerAction<any>>]} */
  const [state, dispatch] = React.useReducer(reducer, initialState);

  React.useEffect(() => {
    dispatch({
      type: ACTION_UPDATE_DATA,
      data,
    });
  }, [data]);

  // @ts-ignore
  return <Provider value={{ state, dispatch }}>{children}</Provider>;
}

ExperimenterDetailsProvider.propTypes = {
  children: PropTypes.any,
  data: PropTypes.object.isRequired,
};

export function useExperimenterDetailsDispatch() {
  const { dispatch } = React.useContext(experimenterDetailsContext);
  return dispatch;
}

export function useExperimenterDetailsState() {
  const { state } = React.useContext(experimenterDetailsContext);
  return state;
}

export function useExperimenterDetailsData() {
  const { state } = React.useContext(experimenterDetailsContext);
  return state.data;
}

export function useExperimenterDetailsErrors() {
  const { state } = React.useContext(experimenterDetailsContext);
  const { clientErrors } = state;
  return { clientErrors };
}
