import React, { Reducer } from "react";

interface ExperimenterData {
  publicDescription: string;
  proposedStartDate: Date;
  proposedEndDate: Date;
  proposedDuration: number;
  startDate?: Date;
  endDate?: Date;
  variants: Record<string, string>;
}

interface ExperimenterState {
  data: ExperimenterData;
}

interface UpdateDataAction {
  type: "UPDATE_DATA";
  data: ExperimenterData;
}

type ExperimenterAction = UpdateDataAction;

const initialState: ExperimenterState = {
  data: null,
};

export const experimenterDetailsContext = React.createContext(initialState);
const { Provider } = experimenterDetailsContext;

function reducer(state, action): ExperimenterState {
  switch (action.type) {
    case "UPDATE_DATA":
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

export const ExperimenterDetailsProvider: React.FC<ExperimenterState> = ({
  children,
  data,
}) => {
  const [state, dispatch] = React.useReducer<
    Reducer<ExperimenterState, ExperimenterAction>
  >(reducer, initialState);

  React.useEffect(() => {
    dispatch({
      type: "UPDATE_DATA",
      data,
    });
  }, [data]);

  return <Provider value={state}>{children}</Provider>;
};

export function useExperimenterDetailsData(): ExperimenterData {
  const { data } = React.useContext(experimenterDetailsContext);
  return data;
}
