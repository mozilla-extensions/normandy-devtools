import React from "react";
import PropTypes from "prop-types";
import { useHistory, useParams } from "react-router-dom";
import { Alert, Button, Icon, IconButton, Modal } from "rsuite";

import {
  useEnvironmentState,
  useSelectedNormandyEnvironmentAPI,
} from "devtools/contexts/environment";
import { useRecipeDetailsState } from "devtools/contexts/recipeDetails";
import GenericField from "devtools/components/recipes/form/fields/GenericField";

export default function RecipeFormHeader() {
  const { recipeId } = useParams();
  const { selectedKey: environmentKey } = useEnvironmentState();
  const history = useHistory();
  const { data, importInstructions } = useRecipeDetailsState();
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

  const saveRecipe = () => {
    const { action } = data;
    const requestSave = normandyApi.saveRecipe(recipeId, {
      ...data,
      action_id: action.id,
    });

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

  const closeSaveModal = () => {
    setShowCommentModal(false);
  };

  const handleBackClick = () => {
    if (recipeId) {
      history.push(`/${environmentKey}/recipes/${recipeId}`);
    } else {
      history.push(`/${environmentKey}/recipes`);
    }
  };

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
          icon={<Icon icon="save" />}
          onClick={handleSaveClick}
        >
          Save
        </IconButton>
      </div>
      <SaveModal
        show={showCommentModal}
        onClose={closeSaveModal}
        onSave={saveRecipe}
      />
    </div>
  );
}

function SaveModal(props) {
  const { show, onClose, onSave } = props;

  const handleSaveClick = () => {
    onSave();
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header>
        <Modal.Title>Save Recipe</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <GenericField label="Comment on Revision" name="comment" />
      </Modal.Body>
      <Modal.Footer>
        <Button appearance="primary" onClick={handleSaveClick}>
          Save
        </Button>
        <Button appearance="subtle" onClick={onClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

SaveModal.propTypes = {
  onClose: PropTypes.func,
  onSave: PropTypes.func,
  show: PropTypes.bool,
};
