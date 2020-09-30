// @ts-nocheck
import React from "react";
import {
  HelpBlock,
  FormGroup,
  ControlLabel,
  InputNumber,
  Row,
  Col,
} from "rsuite";

import InputField from "devtools/components/recipes/form/arguments/fields/InputField";
import SelectField from "devtools/components/recipes/form/arguments/fields/SelectField";
import ToggleField from "devtools/components/recipes/form/arguments/fields/ToggleField";
import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";

export default function ShowHeart() {
  return (
    <FormGroup>
      <Row>
        <Col xs={12}>
          <InputField label="Survey ID" name="surveyId" />
          <InputField label="Message" name="message" />
          <InputField label="Learn More Message" name="learnMoreMessage" />
          <InputField label="Learn More Url" name="learnMoreUrl" />
          <RepeatOptionsField />
        </Col>
        <Col xs={12}>
          <InputField
            label="Engagement Button Label"
            name="engagementButtonLabel"
          />
          <InputField label="Thanks Message" name="thanksMessage" />
          <InputField label="Post-Answer URL" name="postAnswerUrl" />
          <ToggleField
            label="Include Telemetry UUID?"
            name="includeTelemetryUUID"
          >
            Include UUID in Post-Answer URL and Telemetry.
          </ToggleField>
        </Col>
      </Row>
    </FormGroup>
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

  const repeatOptionChangeSideEffect = ({ data, value }) => {
    if (value !== "xdays") {
      const {
        repeatEvery: _omitRepeatEvery,
        ...cleanedArguments
      } = data.arguments;
      return { ...data, arguments: cleanedArguments };
    }

    return { ...data, arguments: { repeatEvery: 1, ...data.arguments } };
  };

  return (
    <>
      <SelectField
        changeSideEffect={repeatOptionChangeSideEffect}
        label="How often should the prompt be shown?"
        name="repeatOption"
        options={SHOW_PROMPT_OPTIONS}
      />
      <RepeatEveryField />
    </>
  );
}

function RepeatEveryField() {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();

  const handleChange = (name) => {
    return (value) => {
      dispatch({
        type: ACTION_UPDATE_DATA,
        data: {
          ...data,
          arguments: {
            ...data.arguments,
            [name]: parseNumericInput(value),
          },
        },
      });
    };
  };

  const parseNumericInput = (value) => {
    if (!value) {
      return "";
    }

    return parseInt(value, 10);
  };

  if (data.arguments.repeatOption !== "xdays") {
    return null;
  }

  return (
    <FormGroup>
      <ControlLabel>Days before user is reprompted</ControlLabel>
      <InputNumber
        min={1}
        postfix="days"
        value={data.arguments.repeatEvery}
        onChange={handleChange("repeatEvery")}
      />
      <HelpBlock>Required</HelpBlock>
    </FormGroup>
  );
}
