import React from "react";
import { Alert, Button, Icon, IconButton, Modal, SelectPicker } from "rsuite";

import { useSelectedNormandyEnvironmentAPI } from "devtools/contexts/environment";
import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";
import { Revision } from "devtools/types/recipes";

const ENDING_REASONS = [
  "Experiment Complete",
  "Filtering Issue",
  "Enrollment Issue",
  "Experiment Design Issue",
];
const DisableRecipeButton: React.FC<{
  recipe: Revision;
  recipeId: number;
  postDispatch: boolean;
}> = ({ recipe, recipeId, postDispatch }) => {
  const dispatch = useRecipeDetailsDispatch();
  const normandyApi = useSelectedNormandyEnvironmentAPI();
  const [buttonsLoading, setButtonsLoading] = React.useState(false);
  const [endingReason, setEndingReason] = React.useState("");

  const [modalShow, setModalShow] = React.useState(false);

  const handleDisable = async (): Promise<void> => {
    try {
      setButtonsLoading(true);

      const updatedRecipe = await normandyApi.disableRecipe(recipeId);
      await normandyApi.patchMetaDataRecipe(
        updatedRecipe.approved_revision.id,
        { ending_reason: endingReason },
      );

      if (postDispatch) {
        dispatch({
          data: updatedRecipe.approved_revision,
          type: ACTION_UPDATE_DATA,
        });
      }
    } catch (err) {
      console.warn(err.message, err.data);
      Alert.error(`An Error Occurred: ${JSON.stringify(err.message)}`, 5000);
    } finally {
      setButtonsLoading(false);
      setModalShow(false);
    }
  };

  return (
    <>
      <IconButton
        className="ml-1"
        color="red"
        disabled={!recipe?.enabled}
        icon={<Icon icon="close-circle" />}
        onClick={() => {
          setModalShow(true);
        }}
      >
        Disable
      </IconButton>
      <Modal show={modalShow}>
        <Modal.Header>
          <Modal.Title>Please Provide a Ending Reason</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <SelectPicker
            block
            data={ENDING_REASONS.map((er) => ({
              label: er,
              value: er,
            }))}
            onSelect={(value) => setEndingReason(value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            appearance="primary"
            color="red"
            loading={buttonsLoading}
            onClick={handleDisable}
          >
            Disable
          </Button>
          <Button appearance="subtle" onClick={() => setModalShow(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DisableRecipeButton;
