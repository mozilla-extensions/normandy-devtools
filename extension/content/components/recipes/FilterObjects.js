import React, { useState } from "react";
import PropTypes from "prop-types";
import { Divider, FormGroup, ControlLabel, Panel } from "rsuite";
import { BrowserOptions } from "devtools/components/recipes/filters/BrowserOptions";
import { GeoOptions } from "devtools/components/recipes/filters/GeoOptions";
import SamplingOptions from "devtools/components/recipes/filters/SamplingOptions";

export default function FilterObjects(props) {
  const { filterObjectData, countryOptions, localeOptions } = props;
  const filterValues = filterObjectData.reduce(
    (obj, item) => Object.assign(obj, { [item.type]: item }),
    {},
  );
  const [collapsed, setCollapsed] = useState(false);

  const handleFOChange = (key, value) => {
    const pluralMapping = {
      country: "countries",
      locale: "locales",
      channel: "channels",
      version: "versions",
    };
    let changedFilterValues = filterObjectData.filter((entry) => {
      return entry.type !== key;
    });
    const pluralKey = pluralMapping[key];

    changedFilterValues.push({ type: key, [pluralKey]: value });

    props.handleChange("filter_object", changedFilterValues);
  };

  const handleSamplingTypeChange = (type) => {
    let changedFilterValues = filterObjectData.filter((entry) => {
      return !entry.type.includes("Sample");
    });
    if (type !== null) {
      props.handleChange("filter_object", [...changedFilterValues, { type }]);
    } else {
      props.handleChange("filter_object", [...changedFilterValues]);
    }
  };

  const handleSamplingFieldChange = (type, key, value) => {
    let changedFilterValues = filterObjectData.filter((entry) => {
      return !entry.type.includes("Sample");
    });
    props.handleChange("filter_object", [
      ...changedFilterValues,
      { ...filterValues[type], [key]: value },
    ]);
  };

  return (
    <FormGroup>
      <ControlLabel>Filter Objects</ControlLabel>
      <a onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? "Show" : "Hide"}
      </a>

      <Panel hidden={collapsed} bordered>
        <SamplingOptions
          filterValues={filterValues}
          handleTypeChange={handleSamplingTypeChange}
          handleFieldChange={handleSamplingFieldChange}
        />
        <Divider />
        <BrowserOptions
          channelFO={filterValues.channel}
          versionFO={filterValues.version}
          handleFOChange={handleFOChange}
        />
        <Divider />
        <GeoOptions
          countries={countryOptions}
          locales={localeOptions}
          countryFO={filterValues.country}
          localeFO={filterValues.locale}
          filterValues={filterValues}
          handleFOChange={handleFOChange}
        />
      </Panel>
    </FormGroup>
  );
}
FilterObjects.propTypes = {
  filterObjectData: PropTypes.object,
  handleChange: PropTypes.func,
  countryOptions: PropTypes.object,
  localeOptions: PropTypes.object,
};
