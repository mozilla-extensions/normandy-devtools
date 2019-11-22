import autobind from "autobind-decorator";
import React from "react";
import { Drawer, Icon, Nav, SelectPicker } from "rsuite";

import { ENVIRONMENTS } from "devtools/config";
import BasePage from "devtools/components/pages/BasePage";
import api from "devtools/utils/api";

/**
 * A page that uses the API and can switch environments
 *
 * Provides an API wrapper at `this.api` which automatically handles
 * environments. Use this wrapper access the API.
 *
 * Overwrite `updateData`, as well as anything from `BasePage`.
 **/
@autobind
class BaseApiPage extends BasePage {
  constructor(props) {
    super(props);

    this.state = {
      environment: "prod",
      loading: false,
      showSettings: false,
    };

    this.api = new Proxy(api, {
      get: (realApi, prop) => {
        return (...args) => realApi[prop](this.state.environment, ...args);
      },
    });
  }

  componentDidMount() {
    this.updateData();
  }

  handleEnvironmentChange(environment) {
    this.setState({ environment }, () => this.updateData());
  }

  showSettings() {
    this.setState({ showSettings: true });
  }

  hideSettings() {
    this.setState({ showSettings: false });
  }

  renderSettingsDrawer() {
    const { showSettings, environment } = this.state;

    const envOptions = Object.keys(ENVIRONMENTS).map(value => ({
      label: value.charAt(0).toUpperCase() + value.slice(1),
      value,
    }));

    return (
      <Drawer
        placement="right"
        show={showSettings}
        onHide={this.hideSettings}
        size="xs"
      >
        <Drawer.Header>Settings</Drawer.Header>
        <Drawer.Body>
          <h5>Environment</h5>
          <SelectPicker
            data={envOptions}
            defaultValue={environment}
            cleanable={false}
            searchable={false}
            onChange={this.handleEnvironmentChange}
          />
        </Drawer.Body>
      </Drawer>
    );
  }

  renderNavItems() {
    return (
      <>
        <Nav.Item icon={<Icon icon="gear" />} onClick={this.showSettings}>
          Settings
        </Nav.Item>
      </>
    );
  }

  renderExtra() {
    return this.renderSettingsDrawer();
  }

  /** Fetch any data, using values from state. Should be overwritten. */
  updateData() {}
}

export default BaseApiPage;
