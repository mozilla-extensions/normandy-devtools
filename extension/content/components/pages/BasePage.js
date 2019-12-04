import autobind from "autobind-decorator";
import React from "react";
import { Header, Icon, Nav, Navbar } from "rsuite";
import PropTypes from "proptypes";

/**
 * A page in the devtools.
 *
 * Overwrite `renderNavItems`, `renderContent`, and `renderExtra`
 */
@autobind
class BasePage extends React.Component {
  static propTypes = {
    /**
     * Nav bar items. Set this to add navbar items. To completely remove the
     * navigation bar, set the prop `hideNavBar={true}`.
     */
    navItems: PropTypes.node,
    hideNavBar: PropTypes.bool,
    /** Main page content. */
    pageContent: PropTypes.node.isRequired,
    /** Extra content on the page that is outside of the page content. Can be used for modals and sidebars. */
    extra: PropTypes.node,
  };

  static defaultProps = {
    hideNavBar: false,
    navItems: (
      <Nav.Item icon={<Icon icon="question-mark" />}>Unimplemented</Nav.Item>
    ),
  };

  render() {
    const { navItems, pageContent, extra, hideNavBar } = this.props;

    return (
      <>
        {!hideNavBar && (
          <Header>
            <Navbar>
              <Nav pullRight>{navItems}</Nav>
            </Navbar>
          </Header>
        )}
        <div className="page-wrapper">{pageContent}</div>
        {extra}
      </>
    );
  }
}

export default BasePage;
