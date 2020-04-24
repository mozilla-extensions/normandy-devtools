import React from "react";
import { InputPicker, FormGroup, ControlLabel, Grid, Row, Col } from "rsuite";

import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";
import { useSelectedNormandyEnvironmentAPI } from "devtools/contexts/environment";
import InputField from "devtools/components/recipes/form/arguments/fields/InputField";
import ToggleField from "devtools/components/recipes/form/arguments/fields/ToggleField";

export default function OptOutStudy() {
  return (
    <Grid fluid>
      <Row>
        <Col xs={12}>
          <InputField label="Study Name" name="name" />
          <InputField
            componentClass="textarea"
            label="Study Description"
            name="description"
          />
        </Col>
        <Col xs={12}>
          <ExtensionPicker />
          <ToggleField label="Prevent New Enrollment" name="isEnrollmentPaused">
            Prevents new users from joining this study cohort. Exisiting users
            will remain in the study.
          </ToggleField>
        </Col>
      </Row>
    </Grid>
  );
}

function ExtensionPicker() {
  const [extensions, setExtensions] = React.useState([]);
  const normandyApi = useSelectedNormandyEnvironmentAPI();

  React.useEffect(() => {
    normandyApi.fetchAllExtensions().then((allExtensions) => {
      setExtensions(allExtensions);
    });
  }, []);
  const options = extensions.map((extension) => ({
    label: extension.name,
    value: extension.id,
  }));

  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();

  const handleChange = (value) => {
    const selectedExtension = extensions.find(
      (element) => element.id === value,
    );
    dispatch({
      type: ACTION_UPDATE_DATA,
      data: {
        ...data,
        arguments: {
          ...data.arguments,
          extensionApiId: value,
          addonUrl: selectedExtension.xpi,
        },
      },
    });
  };

  return (
    <FormGroup>
      <ControlLabel>Extension</ControlLabel>
      <InputPicker
        block
        data={options}
        name="extensionApiId"
        value={data.arguments.extensionApiId}
        onChange={(newValue, _) => {
          handleChange(newValue);
        }}
      />
    </FormGroup>
  );
}
