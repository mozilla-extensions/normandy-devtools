import PropTypes from "prop-types";
import React from "react";

interface ExperimenterData {
  publicDescription: string;
  proposedStartDate: Date;
  proposedEndDate: Date;
  proposedDuration: number;
  startDate?: Date;
  endDate?: Date;
  variants: string[];
}

interface ExperimenterState {
  data: ExperimenterData;
}

interface ExperimenterState {
  data: ExperimenterData;
}

export const INITIAL_EXPERIMENTER_DATA = {
  publicDescription: "",
  proposedStartDate: new Date(),
  proposedEndDate: new Date(),
  proposedDuration: 0,
  startDate: null,
  endDate: null,
  variants: [],
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
        data: {
          ...state.data,
          ...action.data,
        },
      };

    default:
      return state;
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const ExperimenterDetailsProvider: React.FC<ExperimenterState> = ({
  children,
  data,
}) => {
  /** @type {[React.ReducerState<any>, React.Dispatch<React.ReducerAction<any>>]} */
  const [state, dispatch] = React.useReducer(reducer, initialState);

  React.useEffect(() => {
    dispatch({
      type: ACTION_UPDATE_DATA,
      data,
    });
  }, [data]);

  // @ts-ignore
  return <Provider value={state}>{children}</Provider>;
};

export function useExperimenterDetailsData(): ExperimenterData {
  const { data } = React.useContext(experimenterDetailsContext);
  return data;
}
