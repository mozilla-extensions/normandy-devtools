// @ts-nocheck
import React from "react";
import { Col, FormGroup, Row } from "rsuite";

import InputField from "devtools/components/recipes/form/arguments/fields/InputField";
import ToggleField from "devtools/components/recipes/form/arguments/fields/ToggleField";
import MultiPreferenceBranches from "devtools/components/recipes/form/arguments/MultiPreferenceBranches";

export default function MultiPreference() {
  return (
    <>
      <FormGroup>
        <Row>
          <Col xs={12}>
            <InputField label="Experiment Name" name="slug" />
          </Col>
          <Col xs={12}>
            <InputField
              label="Experiment Document URL"
              name="experimentDocumentUrl"
            />
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Row>
          <Col xs={12}>
            <InputField label="User Facing Name" name="userFacingName" />
          </Col>
          <Col xs={12}>
            <InputField
              label="User Facing Description"
              name="userFacingDescription"
            />
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Row>
          <Col xs={12}>
            <ToggleField label="High Volume Recipe" name="isHighVolume">
              Affects the experiment type reported to telemetry, and can be used
              to filter recipe data in analysis. This should be set to true on
              recipes that affect a significant percentage of release.
            </ToggleField>
          </Col>
          <Col xs={12}>
            <ToggleField
              label="Prevent New Enrollment"
              name="isEnrollmentPaused"
            >
              Prevents new users from joining the experiment cohort.
              <br />
              Existing users will remain in the experiment.
            </ToggleField>
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Row>
          <Col xs={24}>
            <MultiPreferenceBranches />
          </Col>
        </Row>
      </FormGroup>
    </>
  );
}
