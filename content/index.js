import React from 'react';
import ReactDOM from 'react-dom';
import { Table } from 'antd';
import {DateTime} from 'luxon'

const messageColumns = [
  {
    title: 'Time',
    dataIndex: 'timeStamp',
    key: 'timeStamp',
    render: ts => new DateTime(ts).toLocaleString(DateTime.TIME_24_WITH_SECONDS),
    width: 100,
  },
  {
    title: 'Level',
    dataIndex: 'level',
    key: 'level',
    width: 100,
  },
  {
    title: 'Message',
    dataIndex: 'message',
    key: 'message',
  },
];

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      normandyManualMode: null,
      messages: [],
    };

    this.updateManualMode = this.updateManualMode.bind(this);
    this.onManualModeCheckbox = this.onManualModeCheckbox.bind(this);
    this.handleLogMessage = this.handleLogMessage.bind(this);
    this.runNormandy = this.runNormandy.bind(this);
  }

  componentWillMount() {
    this.updateManualMode()

    browser.experiments.normandy.onManualMode.addListener(this.updateManualMode);
    browser.experiments.normandy.onNormandyLog.addListener(this.handleLogMessage);
  }

  componentWillUnmount() {
    browser.experiments.normandy.onManualMode.removeListener(this.updateManualMode);
    browser.experiments.normandy.onNormandyLog.removeListener(this.handleLogMessage);
  }

  async updateManualMode() {
    let normandyManualMode = await browser.experiments.normandy.getManualMode();
    this.setState({normandyManualMode});
  }

  handleLogMessage(message) {
    this.setState(({messages}) => ({messages: messages.concat([message])}));
  }

  async onManualModeCheckbox(event) {
    await browser.experiments.normandy.setManualMode(event.target.checked);
  }

  async runNormandy() {
    console.log("Running normandy");
    await browser.experiments.normandy.standardRun();
  }

  render() {
    const {normandyManualMode, messages} = this.state;
    return (
      <div>
        <h1>Normandy</h1>
        <div>
          <label>
            <input type="checkbox" checked={!!normandyManualMode} onChange={this.onManualModeCheckbox}/>
            Manual Mode
          </label>
        </div>
        <div>
          <button onClick={this.runNormandy}>Run Normandy</button>
        </div>
        <div>
          <h2>Log messages</h2>
          <Table
            dataSource={messages}
            columns={messageColumns}
            rowKey={(_, idx) => idx}
            pagination={false}
          />
        </div>
      </div>
    );
  }
}

let target = document.querySelector('#target');

if (!target) {
  target = document.createElement('div');
  target.setAttribute('id', 'target');
  document.body.appendChild(target);
}

ReactDOM.render(<App />, target);
