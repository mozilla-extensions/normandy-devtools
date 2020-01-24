import autobind from "autobind-decorator";
import React from "react";
import Split from "react-split";
import { Loader } from "rsuite";

import DataTree from "devtools/components/common/DataTree";
import JexlColumn from "devtools/components/filters/JexlColumn";
import OutputColumn from "devtools/components/filters/OutputColumn";
import BasePage from "devtools/components/pages/BasePage";

const normandy = browser.experiments.normandy;

@autobind
class FiltersPage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      filterExpression: "",
      lastValue: null,
      error: null,
      running: false,
      context: {},
    };

    this.filterDebounce = null;
  }

  async componentDidMount() {
    const context = await normandy.getClientContext();
    this.setState({ context });
  }

  async handleFilterChange(editor, data, value) {
    this.setState({ filterExpression: value, running: true });
    clearTimeout(this.filterDebounce);
    this.filterDebounce = setTimeout(this.updateFilterResult, 500);
  }

  async updateFilterResult() {
    const { filterExpression } = this.state;
    if (filterExpression === "") {
      this.setState({ running: false, lastValue: null, error: null });
      return;
    }

    this.setState({ running: true });
    try {
      const filterResult = await normandy.evaluateFilter(
        filterExpression,
        this.state.context,
      );
      this.setState({ lastValue: filterResult, error: null });
    } catch (e) {
      this.setState({ error: e });
    } finally {
      this.setState({ running: false });
    }
  }

  handleDoubleClickTreeNode(event, node) {
    const { filterExpression } = this.state;
    this.handleFilterChange(
      null,
      null,
      `${filterExpression}${node.props.value}`,
    );
  }

  render() {
    return (
      <BasePage
        hideNavBar={true}
        pageContent={() => {
          const {
            filterExpression,
            lastValue,
            error,
            context,
            running,
          } = this.state;
          return (
            <Split sizes={[33, 34, 33]} gutterSize={1} className="split">
              <div className="col">
                <div className="filter-column">
                  <header>
                    <strong>Client Context</strong>
                  </header>
                  {!context.normandy && (
                    <div className="text-center">
                      <Loader />
                    </div>
                  )}
                  <DataTree
                    data={context.normandy}
                    title="normandy"
                    key="normandy"
                    onDoubleClick={this.handleDoubleClickTreeNode}
                  />
                </div>
              </div>
              <div className="col">
                <JexlColumn
                  filterExpression={filterExpression}
                  onBeforeChange={this.handleFilterChange}
                />
              </div>
              <div className="col">
                <OutputColumn
                  value={lastValue}
                  error={error}
                  running={running}
                />
              </div>
            </Split>
          );
        }}
      />
    );
  }
}

export default FiltersPage;
