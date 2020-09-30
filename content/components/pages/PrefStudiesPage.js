import React from "react";
import { Loader } from "rsuite";

import PrefStudy from "devtools/components/studies/PrefStudy";

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
    const studies = await normandy.getPreferenceStudies();
    this.setState({ loading: false, studies });
  }

  renderStudiesList() {
    const { studies, loading } = this.state;

    if (loading) {
      return (
        <Loader content="Loading studies&hellip;" size="md" speed="slow" />
      );
    } else if (studies) {
      return (
        <>
          <h3>Active</h3>
          {studies
            .filter((study) => !study.expired)
            .map((study) => (
              <PrefStudy key={study.id} study={study} />
            ))}
          <h3>Expired</h3>
          {studies
            .filter((study) => study.expired)
            .map((study) => (
              <PrefStudy key={study.id} study={study} />
            ))}
        </>
      );
    }

    return null;
  }

  render() {
    return <div className="page-wrapper">{this.renderStudiesList()}</div>;
  }
}
