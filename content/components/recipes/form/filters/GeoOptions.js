import PropTypes from "prop-types";
import React from "react";
import { Col, ControlLabel, FormGroup, Row, TagPicker } from "rsuite";

import {
  useEnvironmentState,
  useSelectedNormandyEnvironmentAPI,
} from "devtools/contexts/environment";
import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";

export default function GeoOptions() {
  const { selectedKey: environmentKey } = useEnvironmentState();
  const normandyApi = useSelectedNormandyEnvironmentAPI();
  const [filters, setFilters] = React.useState({
    locales: [],
    countries: [],
  });

  React.useEffect(() => {
    normandyApi.fetchFilters().then((filters) => {
      setFilters(filters);
    });
  }, [environmentKey, normandyApi]);

  return (
    <Row>
      <Col xs={12}>
        <GeoFilterField
          dataKey="countries"
          label="Countries"
          name="country"
          options={filters.countries}
        />
      </Col>
      <Col xs={12}>
        <GeoFilterField
          dataKey="locales"
          label="Locales"
          name="locale"
          options={filters.locales}
        />
      </Col>
    </Row>
  );
}

function GeoFilterField({ label, name, dataKey, options }) {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();

  let filterObject;
  if (data.filter_object) {
    filterObject = data.filter_object.find((fo) => fo.type === name);
  }

  const value =
    filterObject && filterObject[dataKey] ? filterObject[dataKey] : [];

  const handleChange = (value) => {
    const newFilterObjects = [
      ...data.filter_object.filter((fo) => fo !== filterObject),
    ];

    if (value.length) {
      newFilterObjects.push({
        type: name,
        [dataKey]: value,
      });
    }

    dispatch({
      type: ACTION_UPDATE_DATA,
      data: {
        ...data,
        filter_object: newFilterObjects,
      },
    });
  };

  return (
    <FormGroup>
      <ControlLabel>{label}</ControlLabel>
      <TagPicker
        block
        data={options.map((o) => ({
          label: `${o.value} [${o.key}]`,
          value: o.key,
        }))}
        value={value}
        onChange={handleChange}
      />
    </FormGroup>
  );
}

GeoFilterField.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  dataKey: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
};
