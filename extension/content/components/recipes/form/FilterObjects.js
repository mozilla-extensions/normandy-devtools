import React from "react";
import { ControlLabel, Divider, FormGroup, Panel } from "rsuite";

import SamplingOptions from "devtools/components/recipes/form/filters/SamplingOptions";
import GeoOptions from "devtools/components/recipes/form/filters/GeoOptions";
import BrowserOptions from "devtools/components/recipes/form/filters/BrowserOptions";
import FallbackFO from "devtools/components/recipes/form/filters/FallbackFO";

export default function FilterObjects() {
  return (
    <FormGroup>
      <ControlLabel>Filter Objects</ControlLabel>
      <Panel bordered>
        <SamplingOptions />
        <Divider />
        <BrowserOptions />
        <Divider />
        <GeoOptions />
        <Divider />
        <FallbackFO />
      </Panel>
    </FormGroup>
  );
}
