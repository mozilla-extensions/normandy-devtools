import React, { useContext } from "react";
import { Col, ControlLabel, FormGroup, Row, TagPicker } from "rsuite";

import {
  useEnvironmentState,
  useSelectedNormandyEnvironmentAPI,
} from "devtools/contexts/environment";
import { layoutContext } from "devtools/contexts/layout";
import {
  ACTION_UPDATE_DATA,
  useRecipeDetailsData,
  useRecipeDetailsDispatch,
} from "devtools/contexts/recipeDetails";

// default export
const GeoOptions: React.FC = () => {
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
  }, [environmentKey]);

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
};

export default GeoOptions;

interface GeoFilterFieldProps {
  label?: string;
  name: string;
  dataKey: string;
  options: Array<{ key: string; value: string }>;
}

const GeoFilterField: React.FC<GeoFilterFieldProps> = ({
  label,
  name,
  dataKey,
  options,
}) => {
  const data = useRecipeDetailsData();
  const dispatch = useRecipeDetailsDispatch();
  const { container } = useContext(layoutContext);

  let filterObject;
  if (data.filter_object) {
    filterObject = data.filter_object.find((fo) => fo.type === name);
  }

  const value =
    filterObject && filterObject[dataKey] ? filterObject[dataKey] : [];

  const handleChange = React.useCallback(
    (value: Array<string>): void => {
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
    },
    [data.filter_object, dispatch],
  );

  return (
    <FormGroup>
      <ControlLabel>{label}</ControlLabel>
      <TagPicker
        block
        container={container}
        data={options.map((o) => ({
          label: `${o.value} [${o.key}]`,
          value: o.key,
        }))}
        value={value}
        onChange={handleChange}
      />
    </FormGroup>
  );
};
