import React from "react";
import PropTypes from "prop-types";
import { Timeline, Icon } from "rsuite";
import moment from "moment";

import "./RecipeTimeline.less";

export default class RecipeTimeline extends React.Component {
  static propTypes = {
    history: PropTypes.arrayOf(PropTypes.object).isRequired,
  };

  getEvents() {
    const { history } = this.props;
    const events = [];
    for (const revision of history) {
      const keyBase = `recipe=${revision.recipe.id}::revision=${revision.id}`;
      const descriptionBase = <>Revision {revision.id}</>;

      events.push({
        id: `${keyBase}::created`,
        datetime: moment(revision.date_created, moment.ISO_8601),
        description: (
          <>
            {descriptionBase} Created by <User obj={revision.creator} />
          </>
        ),
        icon: <Icon icon="file-o" size="2x" />,
      });
      if (revision.approval_request) {
        events.push({
          id: `${keyBase}::approvalRequested`,
          datetime: moment(revision.approval_request.created, moment.ISO_8601),
          description: (
            <>
              {descriptionBase} Approval requested by{" "}
              <User obj={revision.approval_request.creator} />
            </>
          ),
          icon: <Icon icon="question-circle2" size="2x" />,
        });
      }
      for (const enabledState of revision.enabled_states) {
        const event = {
          id: `${keyBase}::enabledState=${enabledState.id}`,
          datetime: moment(enabledState.created, moment.ISO_8601),
          description: null,
        };
        if (enabledState.carryover_from) {
          event.description = (
            <>
              {descriptionBase} New live version, approved by{" "}
              <User obj={enabledState.creator} />
            </>
          );
          event.icon = <Icon icon="check-circle" size="2x" />;
        } else if (enabledState.enabled) {
          event.description = (
            <>
              {descriptionBase} Enabled by <User obj={enabledState.creator} />
            </>
          );
          event.icon = <Icon icon="check-circle" size="2x" />;
        } else {
          event.description = (
            <>
              {descriptionBase} Disabled by <User obj={enabledState.creator} />
            </>
          );
          event.icon = <Icon icon="close-circle" size="2x" />;
        }
        events.push(event);
      }
    }

    return events.sort((a, b) => a.datetime - b.datetime);
  }

  render() {
    return (
      <Timeline class="recipe-timeline">
        {this.getEvents().map(({ id, datetime, description, icon = null }) => (
          <Timeline.Item key={id} dot={icon}>
            <Date datetime={datetime} />
            <br />
            {description}
          </Timeline.Item>
        ))}
      </Timeline>
    );
  }
}

function Date({ datetime }) {
  return (
    <time
      timestamp={datetime.toISOString()}
      style={{ fontFamily: "'Fira mono', 'monospace', 'mono', monospace" }}
    >
      {datetime.format("YYYY-MM-DD")}{" "}
      <span style={{ fontWeight: "bold" }}>{datetime.format("HH:mm:ss")}</span>
    </time>
  );
}
Date.propTypes = {
  datetime: PropTypes.instanceOf(moment).isRequired,
};

function User({ obj: { first_name, last_name, id, email } }) {
  if (first_name && last_name) {
    return `${first_name} ${last_name}`;
  } else if (email) {
    return email;
  } else if (id) {
    return `User ${id}`;
  }
  return "Unknown user";
}
User.propTypes = {
  datetime: PropTypes.shape({
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    email: PropTypes.string,
    id: PropTypes.oneOf(PropTypes.number, PropTypes.string),
  }).isRequired,
};
