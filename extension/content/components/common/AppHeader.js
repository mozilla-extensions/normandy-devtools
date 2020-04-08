import React from "react";
import { useLocation, useHistory } from "react-router-dom";
import {
  Avatar,
  ControlLabel,
  Form,
  FormGroup,
  Header,
  Icon,
  IconButton,
  Input,
  InputGroup,
  Modal,
  Popover,
  SelectPicker,
  Whisper,
} from "rsuite";

import Logo from "devtools/components/svg/Logo";
import {
  ACTION_SELECT_ENVIRONMENT,
  login,
  logout,
  useEnvironmentDispatch,
  useEnvironments,
  useEnvironmentState,
  useSelectedEnvironment,
  useSelectedEnvironmentAuth,
} from "devtools/contexts/environment";
import { upperCaseFirst } from "devtools/utils/helpers";

export default function AppHeader() {
  return (
    <Header>
      <div className="app-header">
        <span className="logo">
          <Logo />
          <span className="logo-text">
            Normandy
            <br />
            Devtools
          </span>
        </span>
        <span className="fluid">
          <AddressBar />
        </span>
        <span>
          <EnvironmentConfigurator />
        </span>
        <span className="authenticator">
          <Authenticator />
        </span>
      </div>
    </Header>
  );
}

function AddressBar() {
  function showLocation(location) {
    return `ext+normandy:/${location.pathname}${location.search}`;
  }

  function handleKeyPress(ev) {
    if (ev.key == "Enter") {
      const internalLocation = address.replaceAll(
        /^(ext\+normandy:\/*)/gi,
        "/",
      );
      history.push(internalLocation);
    }
  }

  const location = useLocation();
  const history = useHistory();
  const [address, setAddress] = React.useState("");
  React.useEffect(() => setAddress(showLocation(location)), [location]);

  return (
    <InputGroup>
      <InputGroup.Addon>
        <Icon icon="link" />
      </InputGroup.Addon>
      <Input
        type="text"
        value={address}
        onChange={(value) => setAddress(value)}
        onKeyPress={handleKeyPress}
      />
      <InputGroup.Button>
        <Icon icon="copy" />
      </InputGroup.Button>
    </InputGroup>
  );
}

function EnvironmentConfigurator() {
  const [showEnvironmentModal, setShowEnvironmentModal] = React.useState(false);

  const environments = useEnvironments();
  const envOptions = Object.keys(environments).map((key) => ({
    label: upperCaseFirst(key),
    value: key,
  }));

  const { selectedKey } = useEnvironmentState();
  const dispatch = useEnvironmentDispatch();

  return (
    <>
      <IconButton
        icon={<Icon icon="globe" />}
        onClick={() => {
          setShowEnvironmentModal(true);
        }}
      >
        <strong>Environment:&nbsp;</strong>
        <strong className="text-primary">{upperCaseFirst(selectedKey)}</strong>
      </IconButton>

      <Modal
        show={showEnvironmentModal}
        onHide={() => {
          setShowEnvironmentModal(false);
        }}
      >
        <Modal.Header>
          <Modal.Title>Configure Environment</Modal.Title>
        </Modal.Header>
        <Form>
          <Modal.Body>
            <FormGroup>
              <ControlLabel>Current Environment</ControlLabel>
              <SelectPicker
                data={envOptions}
                defaultValue={selectedKey}
                searchable={false}
                cleanable={false}
                onChange={(key) => {
                  dispatch({
                    type: ACTION_SELECT_ENVIRONMENT,
                    key,
                  });
                }}
              />
            </FormGroup>
          </Modal.Body>
        </Form>
      </Modal>
    </>
  );
}

function Authenticator() {
  const auth = useSelectedEnvironmentAuth();
  const dispatch = useEnvironmentDispatch();
  const environment = useSelectedEnvironment();
  const { selectedKey } = useEnvironmentState();

  const handleLoginClick = () => {
    login(dispatch, selectedKey, environment);
  };

  const handleLogoutClick = () => {
    logout(dispatch, selectedKey);
  };

  if (auth.result) {
    const { idTokenPayload: profile } = auth.result;
    return (
      <Whisper
        trigger="click"
        placement="bottomEnd"
        speaker={
          <Popover>
            <div>
              Signed in as:
              <br />
              <strong>{profile.email}</strong>
            </div>
            <ul className="link-list">
              <li onClick={handleLogoutClick}>Log Out</li>
            </ul>
          </Popover>
        }
      >
        <div className="d-flex">
          <Avatar
            alt={profile.email.substring(0, 1)}
            src={profile.picture}
            size="sm"
            circle
          />
          <Icon icon="caret-down" />
        </div>
      </Whisper>
    );
  }

  return (
    <IconButton
      appearance="primary"
      icon={<Icon icon="user" />}
      onClick={handleLoginClick}
    >
      Log In
    </IconButton>
  );
}
