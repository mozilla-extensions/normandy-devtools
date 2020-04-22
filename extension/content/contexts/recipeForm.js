import React from "react";
import PropTypes from "prop-types";

const initialState = {
  data: {},
  importInstructions: "",
};

export const recipeFormContext = React.createContext(initialState);
const { Provider } = recipeFormContext;

export const ACTION_UPDATE_DATA = "UPDATE_DATA";
export const ACTION_UPDATE_IMPORT_INSTRUCTIONS = "UPDATE_IMPORT_INSTRUCTIONS";

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

    default:
      return state;
  }
}

export function RecipeFormProvider({ children, data, importInstructions }) {
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

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
}

RecipeFormProvider.propTypes = {
  children: PropTypes.any,
  data: PropTypes.object.isRequired,
  importInstructions: PropTypes.string,
};

export function useRecipeFormDispatch() {
  const { dispatch } = React.useContext(recipeFormContext);
  return dispatch;
}

export function useRecipeFormState() {
  const { state } = React.useContext(recipeFormContext);
  return state;
}

export function useRecipeFormData() {
  const { state } = React.useContext(recipeFormContext);
  return state.data;
}

export function useRecipeFormImportInstructions() {
  const { state } = React.useContext(recipeFormContext);
  return state.importInstructions;
}
