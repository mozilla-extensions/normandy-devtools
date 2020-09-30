import PropTypes from "prop-types";
import React from "react";

export const INITIAL_RECIPE_DATA = {
  filter_object: [],
  action: {},
  arguments: {},
};

const initialState = {
  data: INITIAL_RECIPE_DATA,
  importInstructions: "",
  clientErrors: {},
};

export const recipeDetailsContext = React.createContext(initialState);
const { Provider } = recipeDetailsContext;

export const ACTION_UPDATE_DATA = "UPDATE_DATA";
export const ACTION_UPDATE_IMPORT_INSTRUCTIONS = "UPDATE_IMPORT_INSTRUCTIONS";
export const ACTION_UPDATE_CLIENT_ERRORS = "UPDATE_CLIENT_ERRORS";
export const ACTION_REMOVE_CLIENT_ERRORS = "REMOVE_CLIENT_ERRORS";

function reducer(state, action) {
  switch (action.type) {
    case ACTION_UPDATE_DATA:
      return {
        ...state,
        data: action.data,
      };

    case ACTION_UPDATE_IMPORT_INSTRUCTIONS:
      return {
        ...state,
        importInstructions: action.importInstructions,
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

export function RecipeDetailsProvider({ children, data, importInstructions }) {
  /** @type {[React.ReducerState<any>, React.Dispatch<React.ReducerAction<any>>]} */
  const [state, dispatch] = React.useReducer(reducer, initialState);

  React.useEffect(() => {
    dispatch({
      type: ACTION_UPDATE_DATA,
      data,
    });
  }, [data]);

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
  const { clientErrors } = state;
  return { clientErrors };
}
