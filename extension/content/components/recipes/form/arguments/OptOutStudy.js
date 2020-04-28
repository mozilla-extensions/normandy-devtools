import React from "react";
import { Grid, Row, Col } from "rsuite";

import { useRecipeDetailsData } from "devtools/contexts/recipeDetails";
import { useSelectedNormandyEnvironmentAPI } from "devtools/contexts/environment";
import InputField from "devtools/components/recipes/form/arguments/fields/InputField";
import SelectField from "devtools/components/recipes/form/arguments/fields/SelectField";
import ToggleField from "devtools/components/recipes/form/arguments/fields/ToggleField";

export default function OptOutStudy() {
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

  const extensionChangeSideEffect = ({ value }) => {
    const selectedExtension = extensions.find(
      (element) => element.id === value,
    );

    return {
      ...data,
      arguments: {
        ...data.arguments,
        extensionApiId: value,
        addonUrl: selectedExtension.xpi,
      },
    };
  };

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
          <SelectField
            changeSideEffect={extensionChangeSideEffect}
            label="Extension"
            name="extensionApiId"
            options={options}
          />
          <ToggleField label="Prevent New Enrollment" name="isEnrollmentPaused">
            Prevents new users from joining this study cohort. Exisiting users
            will remain in the study.
          </ToggleField>
        </Col>
      </Row>
    </Grid>
  );
}
