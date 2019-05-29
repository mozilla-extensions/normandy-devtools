import React from "react";
import AceEditor from "react-ace";

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
      <div className="content filter-page">
        <div className="context">
          <h2>Client Context</h2>
          <DataTree data={context} title="context" />
        </div>

        <div className="filter">
          <h2>Evaluate JEXL</h2>

          <div>
            <AceEditor
              mode="jexl"
              theme="github"
              onChange={this.handleFilterChange}
              value={filterExpression}
              height={300}
            />
          </div>
        </div>

        <div className="result">
          <h2>Results</h2>
          {error && <div>Last Error: {error.toString()}</div>}
          <pre>
            <code>
              {lastValue === undefined
                ? "undefined"
                : JSON.stringify(lastValue, null, 4)}
            </code>
          </pre>
        </div>
      </div>
    );
  }
}
