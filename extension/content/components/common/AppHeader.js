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
  const location = useLocation();
  const history = useHistory();
  const [address, setAddress] = React.useState("");
  let inputRef;
  let triggerRef;

  React.useEffect(() => {
    const newAddress = `ext+normandy:/${location.pathname}${location.search}`;
    setAddress(newAddress);
  }, [location]);

  const handleKeyPress = (ev) => {
    if (ev.key === "Enter") {
      const addressMatch = address.match(/ext\+normandy:\/(.+?)$/);
      history.push(addressMatch[1]);
    }
  };

  const handleCopyClick = () => {
    inputRef.select();
    document.execCommand("copy");
    inputRef.setSelectionRange(0, 0);
    inputRef.blur();
    triggerRef.show();
    setTimeout(() => {
      triggerRef.hide();
    }, 2000);
  };

  const copyTooltip = <Popover>URL copied to clipboard</Popover>;

  return (
    <InputGroup>
      <InputGroup.Addon>
        <Icon icon="link" />
      </InputGroup.Addon>
      <Input
        inputRef={(ref) => {
          inputRef = ref;
        }}
        type="text"
        value={address}
        onChange={(value) => setAddress(value)}
        onKeyPress={handleKeyPress}
      />
      <Whisper
        placement="bottom"
        speaker={copyTooltip}
        trigger={[]}
        triggerRef={(ref) => {
          triggerRef = ref;
        }}
      >
        <InputGroup.Button onClick={handleCopyClick}>
          <Icon icon="copy" />
        </InputGroup.Button>
      </Whisper>
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
  const history = useHistory();
  const location = useLocation();

  const onEnvironmentChange = (key) => {
    history.push(location.pathname.replace(/^\/.+?\/(.+?)$/, `/${key}/$1`));
  };

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
                cleanable={false}
                data={envOptions}
                defaultValue={selectedKey}
                searchable={false}
                onChange={onEnvironmentChange}
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
        trigger="click"
      >
        <div className="d-flex">
          <Avatar
            circle
            alt={profile.email.substring(0, 1)}
            size="sm"
            src={profile.picture}
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
