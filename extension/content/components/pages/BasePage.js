import autobind from "autobind-decorator";
import React from "react";
import { Header, Icon, Nav, Navbar } from "rsuite";

/**
 * A page in the devtools.
 *
 * Overwrite `renderNavItems`, `renderContent`, and `renderExtra`
 */
@autobind
class BasePage extends React.Component {
  /**
   * Nav bar items. Overwrite this to add, change, or remove navbar items.
   *
   * To overwrite while respecting super class choices, use this pattern:
   *
   * ```js
   * renderNavItems() {
   *   return (
   *     <>
   *       <Nav.Item icon={...}>My Item</Nav.Item
   *       {super.renderNavItems()}
   *     </>
   *   )
   * }
   * ```
   *
   * To completely remove the navigation bar, return `null`.
   */
  renderNavItems() {
    return (
      <Nav.Item icon={<Icon icon="question-mark" />}>Unimplemented</Nav.Item>
    );
  }

  /** Main page content. Overwrite this to show content. */
  renderContent() {
    return "Unimplemented";
  }

  /** Extra content on the page. Overwrite this for modals and sidebars. */
  renderExtra() {
    return null;
  }

  render() {
    const navItems = this.renderNavItems();

    return (
      <>
        {navItems && (
          <Header>
            <Navbar>
              <Nav pullRight>{this.renderNavItems()}</Nav>
            </Navbar>
          </Header>
        )}
        <div className="page-wrapper">{this.renderContent()}</div>
        {this.renderExtra()}
      </>
    );
  }
}

export default BasePage;
