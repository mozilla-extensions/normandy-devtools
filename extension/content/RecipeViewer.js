import React from 'react';
import { Pagination, Spin, Collapse, Icon, Divider, Button } from 'antd';
import yaml from 'js-yaml';

import api from './api';

const PAGE_SIZE = 10;

export default class RecipeViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recipePages: {},
      loading: true,
      page: 1,
      count: 0,
    };

    this.handlePageChange = this.handlePageChange.bind(this);
  }

  async componentWillMount() {
    const {page} = this.state;
    let data = await api.fetchRecipePage(page, {ordering: '-id'});
    this.setState(({recipePages}) => ({
      recipePages: {...recipePages, [page]: data.results},
      loading: false,
      count: data.count,
    }))
  }

  async handlePageChange(page, pageSize) {
    if (pageSize && pageSize !== PAGE_SIZE) {
      throw new Exception("Can't configure page size");
    }
    this.setState({ loading: true });
    let data = await api.fetchRecipePage(page);
    this.setState(({recipePages}) => ({
      recipePages: {...recipePages, [page]: data.results},
      page,
      loading: false,
      count: data.count,
    }))
  }

  render() {
    const {recipePages, loading, page, count} = this.state;
    const recipes = recipePages[page];

    return (
      <section className="recipe-viewer">
        <h2>Recipes</h2>
        <Spin spinning={loading}>
          <Collapse className="recipe-list">
            {recipes && recipes.map(recipe => <Recipe key={recipe.id} recipe={recipe}/>)}
          </Collapse>
        </Spin>
        <Pagination current={page} pageSize={PAGE_SIZE} total={count} onChange={this.handlePageChange} />
      </section>
    );
  }
}

class Recipe extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterMatches: null,
    };
  }

  async componentWillMount() {
    const {recipe} = this.props;
    let filterMatches = await browser.experiments.normandy.evaluateFilter(recipe.filter_expression, recipe);
    this.setState({filterMatches});
  }

  render() {
    const {recipe, ...panelProps} = this.props;
    const {name, id, filter_expression, arguments: arguments_} = recipe;
    const {filterMatches} = this.state;

    return (
      <Collapse.Panel
        {...panelProps}
        header={<RecipeHeader recipe={recipe} filterMatches={filterMatches} />}
        key={id}
      >
        <h4>Filter</h4>
        <pre><code>{filter_expression}</code></pre>
        <h4>Arguments</h4>
        <pre><code>{yaml.safeDump(arguments_, {sortKeys: true, indent: 4, noRefs: true})}</code></pre>
      </Collapse.Panel>
    );
  }
}

class RecipeHeader extends React.PureComponent {
  render() {
    const {filterMatches, recipe} = this.props;
    const {id, name, enabled} = recipe;

    return (
      <div className="recipe-header">
        <h3>{id} - {name}</h3>
        <div className="icons">
          <RunRecipeButton recipe={recipe} />
          <Divider type="vertical" />
          <FilterMatchIcon match={filterMatches} />
          {enabled
            ? <Icon type="check-circle" title="Recipe Enabled" style={{color: 'green'}}/>
            : <Icon type="close-circle-o" title="Recipe Disabled" style={{color: 'red'}}/>
          }
        </div>
      </div>
    );
  }
}

class FilterMatchIcon extends React.PureComponent {
  render() {
    const {match} = this.props;
          // {filterMatches && <Icon type="user" title="This browser matches this recipe's filter"/>}
          // {filterMatches === null && <Icon type="question" title="Loading" style={{opacity: 0.3}}/>}
    let icon = null;
    if (match === null) {
      icon = <Icon type="question" style={{opacity: 0.5}} />;
    } else if (match === true) {
      icon = <Icon type="check" style={{color: 'green'}} />
    } else {
      icon = <Icon type="close" style={{color: 'black'}} />
    }
    let hover;
    if (match) {
      hover = "This browser matches this recipe's filter";
    } else {
      hover = "This browser does not match this recipe's filter";
    }
    return (
      <span className="filter-match" title={hover}>
        <Icon type="user"/>
        {icon}
      </span>
    );
  }
}

class RunRecipeButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      running: false,
    }
    this.handleClick = this.handleClick.bind(this);
  }

  async handleClick() {
    const {recipe} = this.props;
    this.setState({running: true});
    // Normandy expects a v1-style recipe, but we have a v3-style recipe. Convert it.
    const currentRevision = recipe.approved_revision || recipe.latest_revision;
    const v1Recipe = {
      id: recipe.id,
      name: currentRevision.recipe.name,
      enabled: currentRevision.recipe.enabled,
      is_approved: currentRevision.recipe.is_approved,
      revision_id: currentRevision.id,
      action: currentRevision.recipe.action.name,
      arguments: currentRevision.recipe.arguments,
      filter_expression: currentRevision.recipe.filter_expression,
    };
    await browser.experiments.normandy.runRecipe(v1Recipe);
    this.setState({running: false});
  }

  render() {
    const {recipe} = this.props;
    const {running} = this.state;

    return (
      <Button onClick={this.handleClick} disabled={running} title="Run this recipe, ignoring filters">
        {running
          ? <Icon type="reload" spin />
          : <Icon type="caret-right" />
        }
      </Button>
    )
  }
}
