import autobind from "autobind-decorator";
import React from "react";
import { Drawer, Icon, Nav, SelectPicker } from "rsuite";
import PropTypes from "proptypes";

import { ENVIRONMENTS } from "devtools/config";
import BasePage from "devtools/components/pages/BasePage";
import api from "devtools/utils/api";

/**
 * A page that uses the API and can switch environments
 *
 * Provides an API wrapper at `this.api` which automatically handles
 * environments. Use this wrapper access the API.
 **/
@autobind
class BaseApiPage extends React.Component {
  static propTypes = {
    /** Fetch any data, using values from state. Should be overwritten. */
    updateData: PropTypes.func.isRequired,

    /**
     * Nav bar items. Set this to add navbar items.
     */
    navItems: PropTypes.node,

    /** Main page content. */
    pageContent: PropTypes.func.isRequired,

    /**
     * Extra content on the page that is outside of the page content. Can be
     * used for modals and sidebars.
     */
    extra: PropTypes.node,
  };

  static defaultProps = {};

  constructor(props) {
    super(props);

    this.state = {
      environment: "prod",
      loading: false,
      showSettings: false,
    };

    this.apiProxy = new Proxy(api, {
      get: (realApi, prop) => {
        if (!api[prop]) {
          throw new Error(`No API method named ${prop}`);
        }
        return (...args) => realApi[prop](this.state.environment, ...args);
      },
    });
  }

  componentDidMount() {
    this.props.updateData({
      api: this.apiProxy,
      environment: this.state.environment,
    });
  }

  handleEnvironmentChange(environment) {
    this.setState({ environment }, () =>
      this.props.updateData({
        api: this.apiProxy,
        environment: this.state.environment,
      }),
    );
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

  render() {
    const { navItems, extra, pageContent } = this.props;
    const { environment } = this.state;

    return (
      <BasePage
        navItems={
          <>
            <Nav.Item icon={<Icon icon="gear" />} onClick={this.showSettings}>
              Settings
            </Nav.Item>
            {navItems}
          </>
        }
        hideNavBar={false}
        extra={
          <>
            {this.renderSettingsDrawer()}
            {extra}
          </>
        }
        pageContent={pageContent({ environment, api: this.apiProxy })}
      />
    );
  }
}

export default BaseApiPage;
