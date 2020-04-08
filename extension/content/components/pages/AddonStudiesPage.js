import React from "react";
import { Loader } from "rsuite";

import AddonStudy from "devtools/components/studies/AddonStudy";

const normandy = browser.experiments.normandy;

export default class PrefStudiesPage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      studies: [],
      loading: true,
    };
  }

  async componentDidMount() {
    this.setState({ loading: true });
    const studies = await normandy.getAddonStudies();
    this.setState({ loading: false, studies });
  }

  renderStudiesList() {
    const { studies, loading } = this.state;

    if (loading) {
      return (
        <Loader size="md" speed="slow" content="Loading studies&hellip;" />
      );
    } else if (studies) {
      return (
        <React.Fragment>
          <h3>Active</h3>
          {studies
            .filter((study) => !study.expired)
            .map((study) => (
              <AddonStudy key={study.id} study={study} />
            ))}
          <h3>Expired</h3>
          {studies
            .filter((study) => study.expired)
            .map((study) => (
              <AddonStudy key={study.id} study={study} />
            ))}
        </React.Fragment>
      );
    }

    return null;
  }

  render() {
    return <div className="page-wrapper">{this.renderStudiesList()}</div>;
  }
}
