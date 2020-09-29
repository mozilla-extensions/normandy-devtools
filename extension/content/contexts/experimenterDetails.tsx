import PropTypes from "prop-types";
import React from "react";

interface ExperimenterData {
  publicDescription: string;
  proposedStartDate: Date;
  proposedDuration: number;
}

interface ExperimenterState {
  data: ExperimenterData;
}

export const INITIAL_EXPERIMENTER_DATA = {
  publicDescription: "",
  proposedStartDate: new Date(),
  proposedDuration: 0,
};

const initialState: ExperimenterState = {
  data: INITIAL_EXPERIMENTER_DATA,
};

export const experimenterDetailsContext = React.createContext(initialState);
const { Provider } = experimenterDetailsContext;

export const ACTION_UPDATE_DATA = "UPDATE_DATA";

function reducer(state, action): ExperimenterState {
  switch (action.type) {
    case ACTION_UPDATE_DATA:
      return {
        ...state,
        data: action.data,
      };

    default:
      return state;
  }
}

export function ExperimenterDetailsProvider({
  children,
  data,
}): React.Provider<ExperimenterState> {
  /** @type {[React.ReducerState<any>, React.Dispatch<React.ReducerAction<any>>]} */
  const [state, dispatch] = React.useReducer(reducer, initialState);

  React.useEffect(() => {
    dispatch({
      type: ACTION_UPDATE_DATA,
      data,
    });
  }, [data]);

  return <Provider value={state}>{children}</Provider>;
}

ExperimenterDetailsProvider.propTypes = {
  children: PropTypes.any,
  data: PropTypes.object.isRequired,
};

export function useExperimenterDetailsData(): ExperimenterData {
  const { data } = React.useContext(experimenterDetailsContext);
  return data;
}
