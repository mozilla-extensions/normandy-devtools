import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { Alert, Button, Icon, IconButton, Input, Modal } from "rsuite";

import {
  useEnvironmentState,
  useSelectedNormandyEnvironmentAPI,
} from "devtools/contexts/environment";
import {
  useRecipeDetailsState,
  useRecipeDetailsErrors,
} from "devtools/contexts/recipeDetails";

// export default
const RecipeFormHeader: React.FC = () => {
  const { recipeId } = useParams<{ recipeId }>();
  const { selectedKey: environmentKey } = useEnvironmentState();
  const history = useHistory();
  const { data, importInstructions } = useRecipeDetailsState();
  const { clientErrors } = useRecipeDetailsErrors();
  const normandyApi = useSelectedNormandyEnvironmentAPI();
  const [showCommentModal, setShowCommentModal] = React.useState(false);

  const handleSaveClick = (): void => {
    try {
      if (importInstructions) {
        throw Error("Import Instructions not empty!");
      }

      setShowCommentModal(true);
    } catch (err) {
      Alert.error(err.message);
    }
  };

  const saveRecipe = (comment): void => {
    const { action, ...cleanedData } = data;
    let id;
    if (!history.location.pathname.includes("clone")) {
      id = recipeId;
    }

    const requestSave = normandyApi.saveRecipe(id, {
      ...cleanedData,
      comment,
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

  const handleBackClick = (): void => {
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
};

interface SaveModalProps {
  onSave: (comment: string) => void;
  setShowModal: (show: boolean) => void;
  show: boolean;
}

const SaveModal: React.FC<SaveModalProps> = ({
  show,
  setShowModal,
  onSave,
}) => {
  const [comment, setComment] = React.useState("");

  const handleSaveClick = (): void => {
    onSave(comment);
    closeModal();
  };

  const closeModal = (): void => {
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
};

export default RecipeFormHeader;
