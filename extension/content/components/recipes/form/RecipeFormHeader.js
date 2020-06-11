import PropTypes from "prop-types";
import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { Alert, Button, Icon, IconButton, Input, Modal } from "rsuite";

import { INITIAL_ACTION_ARGUMENTS } from "devtools/components/recipes/form/ActionArguments";
import {
  useEnvironmentState,
  useSelectedNormandyEnvironmentAPI,
} from "devtools/contexts/environment";
import {
  useRecipeDetailsState,
  useRecipeDetailsErrors,
} from "devtools/contexts/recipeDetails";

export default function RecipeFormHeader() {
  const { recipeId } = useParams();
  const { selectedKey: environmentKey } = useEnvironmentState();
  const history = useHistory();
  const { data, importInstructions } = useRecipeDetailsState();
  const { clientErrors } = useRecipeDetailsErrors();
  const normandyApi = useSelectedNormandyEnvironmentAPI();
  const [showCommentModal, setShowCommentModal] = React.useState(false);

  const handleSaveClick = () => {
    try {
      if (importInstructions) {
        throw Error("Import Instructions not empty!");
      }

      setShowCommentModal(true);
    } catch (err) {
      Alert.error(err.message);
    }
  };

  const isEnrollmentPausedRequired = (action, data) => {
    const { name } = action;
    const { arguments: args } = data;
    const intitation_action_args = INITIAL_ACTION_ARGUMENTS[name];
    return (
      !("isEnrollmentPaused" in args) &&
      "isEnrollmentPaused" in intitation_action_args
    );
  };

  const saveRecipe = (comment) => {
    const { action, ...cleanedData } = data;

    let id;
    if (!history.location.pathname.includes("clone")) {
      id = recipeId;
    }

    let saveData = { ...cleanedData, comment, action_id: action.id };

    if (isEnrollmentPausedRequired(action, cleanedData)) {
      saveData = {
        ...saveData,
        arguments: { ...saveData.arguments, isEnrollmentPaused: false },
      };
    }

    const requestSave = normandyApi.saveRecipe(id, saveData);

    requestSave
      .then((savedRecipe) => {
        history.push(`/${environmentKey}/recipes/${savedRecipe.id}`);
        Alert.success("Changes Saved");
      })
      .catch((err) => {
        console.warn(err.message, err.data);
        Alert.error(`An Error Occurred: ${JSON.stringify(err.data)}`, 5000);
      });
  };

  const handleBackClick = () => {
    if (recipeId) {
      history.push(`/${environmentKey}/recipes/${recipeId}`);
    } else {
      history.push(`/${environmentKey}/recipes`);
    }
  };

  const isSaveDisabled = Boolean(Object.keys(clientErrors).length);

  return (
    <div className="page-header">
      <div className="flex-grow-1">
        <IconButton
          appearance="subtle"
          icon={<Icon icon="back-arrow" />}
          onClick={handleBackClick}
        >
          Back
        </IconButton>
      </div>
      <div className="d-flex align-items-center text-right">
        <IconButton
          appearance="primary"
          className="ml-1"
          disabled={isSaveDisabled}
          icon={<Icon icon="save" />}
          onClick={handleSaveClick}
        >
          Save
        </IconButton>
      </div>
      <SaveModal
        setShowModal={setShowCommentModal}
        show={showCommentModal}
        onSave={saveRecipe}
      />
    </div>
  );
}

function SaveModal(props) {
  const { show, setShowModal, onSave } = props;
  const [comment, setComment] = React.useState("");

  const handleSaveClick = () => {
    onSave(comment);
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <Modal show={show} onHide={closeModal}>
      <Modal.Header>
        <Modal.Title>Save Recipe</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Input
          componentClass="textarea"
          placeholder="Please describe the changes you are making&hellip;"
          value={comment}
          onChange={setComment}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button appearance="primary" onClick={handleSaveClick}>
          Save
        </Button>
        <Button appearance="subtle" onClick={closeModal}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

SaveModal.propTypes = {
  onSave: PropTypes.func,
  setShowModal: PropTypes.func,
  show: PropTypes.bool,
};
