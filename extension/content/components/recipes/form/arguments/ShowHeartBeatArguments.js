import React from "react";

import PropTypes from "prop-types";
import {
  HelpBlock,
  FormGroup,
  ControlLabel,
  InputNumber,
  Grid,
  Row,
  Col,
} from "rsuite";

import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";

import InputField from "devtools/components/recipes/form/arguments/fields/InputField";
import SelectField from "devtools/components/recipes/form/arguments/fields/SelectField";
import CheckboxField from "devtools/components/recipes/form/arguments/fields/CheckboxField";
import InputUrlField from "devtools/components/recipes/form/arguments/fields/InputUrlField";

export default function ShowHeartBeatArguments() {
  return (
    <Grid fluid>
      <Row>
        <Col xs={12}>
          <InputField label="Survey ID" name="surveyID" />
          <InputField label="Message" name="message" />
          <InputField label="Learn More Message" name="learnMoreMessage" />
          <RepeatOptionsField />
        </Col>
        <Col xs={12}>
          <InputField
            label="Engagement Button Label"
            name="engagementButtonLabel"
          />
          <InputField label="Thanks Message" name="thanksMessage" />
          <InputUrlField label="Post-Answer URL" name="postAnswerUrl" />
          <CheckboxField
            helpText="Include UUID in Post-Answer URL and Telemetry."
            label="Include Telemetry UUID?"
            name="includeTelemetryUUID"
          />
        </Col>
      </Row>
    </Grid>
  );
}

function RepeatOptionsField() {
  const SHOW_PROMPT_OPTIONS = [
    { label: "Show this prompt once.", value: "once" },
    {
      label: "Show users every X days.",
      value: "xdays",
    },
    {
      label:
        "Show until the user interacts with the heartbeat prompt, then never again.",
      value: "nag",
    },
  ];

  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();

  const handleChange = (name, value) => {
    dispatch({
      type: ACTION_UPDATE_DATA,
      data: {
        ...data,
        arguments: {
          ...data.arguments,
          [name]: parseInt(value),
        },
      },
    });
  };

  const repeatEveryOption = () => {
    if (data.arguments.repeatOption === "xdays") {
      return (
        <FormGroup>
          <ControlLabel>Days before user is reprompted</ControlLabel>
          <InputNumber
            min={1}
            postfix="days"
            value={data.arguments.repeatEvery}
            onChange={(newValue) => handleChange("repeatEvery", newValue)}
          />
          <HelpBlock>Required</HelpBlock>
        </FormGroup>
      );
    }

    return null;
  };

  return (
    <React.Fragment>
      <SelectField
        label="How often should the prompt be shown?"
        name="repeatOption"
        options={SHOW_PROMPT_OPTIONS}
      />
      {repeatEveryOption()}
    </React.Fragment>
  );
}

ShowHeartBeatArguments.propTypes = {
  handleChange: PropTypes.func,
  name: PropTypes.name,
  value: PropTypes.string,
};
