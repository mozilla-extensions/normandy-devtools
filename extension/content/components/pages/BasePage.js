import autobind from "autobind-decorator";
import React from "react";
import { Header, Icon, Nav, Navbar } from "rsuite";
import PropTypes from "proptypes";

/**
 * A page in the devtools.
 *
 * Use by composing into your component. Provide at least `pageContent`, which
 * will be included into the page.
 */
@autobind
class BasePage extends React.Component {
  static propTypes = {
    /**
     * Nav bar items. If this is empty the navbar will still be shown. To
     * completely remove the navigation bar, set the prop `hideNavBar={true}`.
     */
    navItems: PropTypes.func,

    /** Hide the navbar completely. */
    hideNavBar: PropTypes.bool,

    /** Main page content. */
    pageContent: PropTypes.func.isRequired,

    /**
     * Extra content on the page that is outside of the page content. Can be
     * used for modals and sidebars.
     */
    extra: PropTypes.func,
  };

  static defaultProps = {
    hideNavBar: false,
    navItems: () => (
      <Nav.Item icon={<Icon icon="question-mark" />}>Unimplemented</Nav.Item>
    ),
    extra: () => null,
  };

  render() {
    const { navItems, pageContent, extra, hideNavBar } = this.props;

    return (
      <>
        {!hideNavBar && (
          <Header>
            <Navbar>
              <Nav pullRight>{navItems()}</Nav>
            </Navbar>
          </Header>
        )}
        <div className="page-wrapper">{pageContent()}</div>
        {extra()}
      </>
    );
  }
}

export default BasePage;
