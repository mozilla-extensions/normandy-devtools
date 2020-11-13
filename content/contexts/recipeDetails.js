import PropTypes from "prop-types";
import React from "react";

export const INITIAL_RECIPE_DATA = {
  filter_object: [],
  action: {},
  arguments: {},
};

const initialState = {
  data: INITIAL_RECIPE_DATA,
  statusData: INITIAL_RECIPE_DATA,
  importInstructions: "",
  clientErrors: {},
  serverErrors: {},
};

export const recipeDetailsContext = React.createContext(initialState);
const { Provider } = recipeDetailsContext;

export const ACTION_UPDATE_DATA = "UPDATE_DATA";
export const ACTION_UPDATE_IMPORT_INSTRUCTIONS = "UPDATE_IMPORT_INSTRUCTIONS";
export const ACTION_SET_SERVER_ERRORS = "ACTION_SET_SERVER_ERRORS";
export const ACTION_CLEAR_SERVER_ERRORS = "ACTION_CLEAR_SERVER_ERRORS";
export const ACTION_UPDATE_CLIENT_ERRORS = "UPDATE_CLIENT_ERRORS";
export const ACTION_REMOVE_CLIENT_ERRORS = "REMOVE_CLIENT_ERRORS";

function reducer(state, action) {
  switch (action.type) {
    case ACTION_UPDATE_DATA:
      return {
        ...state,
        data: action.data || state.data,
        statusData: action.statusData || state.statusData,
      };

    case ACTION_UPDATE_IMPORT_INSTRUCTIONS:
      return {
        ...state,
        importInstructions: action.importInstructions,
      };

    case ACTION_CLEAR_SERVER_ERRORS:
      return {
        ...state,
        serverErrors: {},
      };

    case ACTION_SET_SERVER_ERRORS:
      return {
        ...state,
        serverErrors: action.errors,
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

export function RecipeDetailsProvider({
  children,
  data,
  importInstructions,
  statusData,
}) {
  /** @type {[React.ReducerState<any>, React.Dispatch<React.ReducerAction<any>>]} */
  const [state, dispatch] = React.useReducer(reducer, initialState);

  React.useEffect(() => {
    dispatch({
      type: ACTION_UPDATE_DATA,
      data,
      statusData: statusData || data,
    });
  }, [data, statusData]);

  React.useEffect(() => {
    dispatch({
      type: ACTION_UPDATE_IMPORT_INSTRUCTIONS,
      importInstructions,
    });
  }, [importInstructions]);

  // @ts-ignore
  return <Provider value={{ state, dispatch }}>{children}</Provider>;
}

RecipeDetailsProvider.propTypes = {
  children: PropTypes.any,
  data: PropTypes.object.isRequired,
  statusData: PropTypes.object,
  importInstructions: PropTypes.string,
};

export function useRecipeDetailsDispatch() {
  const { dispatch } = React.useContext(recipeDetailsContext);
  return dispatch;
}

export function useRecipeDetailsState() {
  const { state } = React.useContext(recipeDetailsContext);
  return state;
}

export function useRecipeDetailsData() {
  const { state } = React.useContext(recipeDetailsContext);
  return state.data;
}

export function useRecipeDetailsImportInstructions() {
  const { state } = React.useContext(recipeDetailsContext);
  return state.importInstructions;
}

export function useRecipeDetailsErrors() {
  const { state } = React.useContext(recipeDetailsContext);
  const { clientErrors, serverErrors } = state;
  return { clientErrors, serverErrors };
}
