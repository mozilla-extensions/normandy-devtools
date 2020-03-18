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
  globalStateContext,
} from "devtools/contexts/globalState";
import environmentStore from "devtools/utils/environmentStore";

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
        onChange={ev => setAddress(ev.target.value)}
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

  const environments = environmentStore.getAll();
  const envOptions = Object.keys(environments).reduce((reduced, value) => {
    reduced.push({
      label: value.charAt(0).toUpperCase() + value.slice(1),
      value,
    });
    return reduced;
  }, []);

  const { state: globalState, dispatch } = React.useContext(globalStateContext);

  return (
    <>
      <IconButton
        icon={<Icon icon="globe" />}
        onClick={() => {
          setShowEnvironmentModal(true);
        }}
      >
        <strong>Environment:&nbsp;</strong>
        <span className="text-primary">
          {globalState.selectedEnvironment.key}
        </span>
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
                defaultValue={globalState.selectedEnvironment.key}
                searchable={false}
                cleanable={false}
                onChange={v => {
                  dispatch({
                    type: ACTION_SELECT_ENVIRONMENT,
                    environment: v,
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
  const { state: globalState } = React.useContext(globalStateContext);
  const environment = environmentStore.get(globalState.selectedEnvironment.key);

  if (environment.isAuthenticated()) {
    const { profile } = environment.authSession;
    return (
      <Whisper
        trigger="click"
        placement="bottomEnd"
        speaker={
          <Popover title={`Signed in as: ${profile.email}`}>
            <a
              onClick={() => {
                environment.authSession.logout();
              }}
            >
              Log Out
            </a>
          </Popover>
        }
      >
        <Avatar
          alt={profile.email.substring(0, 1)}
          src={profile.picture}
          size="sm"
          circle
        />
      </Whisper>
    );
  }

  return (
    <IconButton
      appearance="primary"
      icon={<Icon icon="user" />}
      onClick={() => {
        environment.authSession.login();
      }}
    >
      Log In
    </IconButton>
  );
}

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
        <span>
          <Authenticator />
        </span>
      </div>
    </Header>
  );
}
