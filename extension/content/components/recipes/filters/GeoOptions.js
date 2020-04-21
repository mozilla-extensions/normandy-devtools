import React from "react";
import PropTypes from "prop-types";
import { FormGroup, ControlLabel, Row, Col, TagPicker } from "rsuite";

export const GeoOptions = (props) => {
  const { countries, locales, countryFO, localeFO, handleFOChange } = props;

  return (
    <Row>
      <Col xs={12}>
        <FormGroup>
          <ControlLabel>Countries</ControlLabel>
          <TagPicker
            block
            data={countries}
            value={countryFO ? countryFO.countries : []}
            onChange={(value) => handleFOChange("country", value)}
          />
        </FormGroup>
      </Col>
      <Col xs={12}>
        <FormGroup>
          <ControlLabel>Locales</ControlLabel>
          <TagPicker
            block
            data={locales}
            value={localeFO ? localeFO.locales : []}
            onChange={(value) => handleFOChange("locale", value)}
          />
        </FormGroup>
      </Col>
    </Row>
  );
};

GeoOptions.propTypes = {
  countries: PropTypes.array,
  locales: PropTypes.array,
  countryFO: PropTypes.object,
  localeFO: PropTypes.object,
  handleFOChange: PropTypes.func,
};
