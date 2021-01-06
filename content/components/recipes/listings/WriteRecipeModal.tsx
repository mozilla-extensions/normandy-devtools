import React, { useState } from "react";
import { Button, Modal } from "rsuite";

import CodeMirror from "devtools/components/common/CodeMirror";

const WriteRecipeModal: React.FC<{
  arbitraryRecipe: string;
  showWriteRecipes: boolean;
  setShowWriteRecipes: (show: boolean) => void;
  setArbitraryRecipe: (newRecipe: string) => void;
}> = ({
  arbitraryRecipe,
  setShowWriteRecipes,
  showWriteRecipes,
  setArbitraryRecipe,
}) => {
  const [runningArbitrary, setRunningArbitrary] = useState(false);

  async function runArbitraryRecipe(): Promise<void> {
    setRunningArbitrary(true);
    try {
      await browser.experiments.normandy.runRecipe(JSON.parse(arbitraryRecipe));
    } finally {
      setRunningArbitrary(false);
    }
  }

  return (
    <Modal
      show={showWriteRecipes}
      size="lg"
      onHide={() => setShowWriteRecipes(false)}
    >
      <Modal.Header>
        <Modal.Title>Write a recipe</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <CodeMirror
          options={{
            mode: "javascript",
            lineNumbers: true,
          }}
          value={arbitraryRecipe}
          onBeforeChange={(editor, data, value) => setArbitraryRecipe(value)}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button
          appearance="primary"
          disabled={runningArbitrary}
          onClick={runArbitraryRecipe}
        >
          Run
        </Button>
        <Button appearance="subtle" onClick={() => setShowWriteRecipes(false)}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WriteRecipeModal;
