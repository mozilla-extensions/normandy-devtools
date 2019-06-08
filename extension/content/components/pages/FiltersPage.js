import React from "react";
import AceEditor from "react-ace";
import Split from "react-split";

import DataTree from "../DataTree";

const normandy = browser.experiments.normandy;

export default class FiltersPage extends React.Component {
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

    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.updateFilterResult = this.updateFilterResult.bind(this);
  }

  async componentDidMount() {
    const context = await normandy.getClientContext();
    this.setState({ context });
  }

  async handleFilterChange(value) {
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

  render() {
    const { filterExpression, lastValue, error, context } = this.state;
    return (
      <Split sizes={[33, 34, 33]} className="split">
        <div className="col">
          <strong>Client Context</strong>
          <DataTree data={context} title="context" />
        </div>
        <div className="col">
          <strong>JEXL Filter Expression</strong>
          <AceEditor
            mode="javascript"
            theme="tomorrow-night"
            onChange={this.handleFilterChange}
            value={filterExpression}
            height="100%"
            width="100%"
          />
        </div>
        <div className="col">
          <strong>Output</strong>
          {error && <div>Last Error: {error.toString()}</div>}
          <pre>
            <code>
              {lastValue === undefined
                ? "undefined"
                : JSON.stringify(lastValue, null, 4)}
            </code>
          </pre>
        </div>
      </Split>
    );
  }
}
