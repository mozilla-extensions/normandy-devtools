import React from "react";
import { Form } from "rsuite";

import GenericField from "devtools/components/recipes/form/fields/GenericField";
import CodeMirrorField from "devtools/components/recipes/form/fields/CodeMirrorField";
import ActionPicker from "devtools/components/recipes/form/fields/ActionPicker";
import ActionArguments from "devtools/components/recipes/form/ActionArguments";
import FilterObjects from "devtools/components/recipes/form/FilterObjects";
import ImportInstructions from "devtools/components/recipes/form/fields/ImportInstructions";

export default function RecipeForm() {
  return (
    <Form fluid>
      <GenericField required label="Name" name="name" />

      <GenericField label="Experimenter Slug" name="experimenter_slug" />

      <ImportInstructions />

      <FilterObjects />

      <CodeMirrorField
        label="Extra Filter Expression"
        name="extra_filter_expression"
      />

      <ActionPicker />

      <ActionArguments />
    </Form>
  );
}
