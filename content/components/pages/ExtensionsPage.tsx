import cx from "classnames";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  ButtonToolbar,
  Col,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  Grid,
  Icon,
  IconButton,
  Pagination,
  Panel,
  Popover,
  PopoverProps,
  Row,
  Tag,
  Uploader,
  Whisper,
} from "rsuite";
import { FileType } from "rsuite/lib/Uploader";
import { WhisperInstance } from "rsuite/lib/Whisper";

import AsyncHookView from "devtools/components/common/AsyncHookView";
import { useSelectedNormandyEnvironmentAPI } from "devtools/contexts/environment";
import styles from "devtools/less/extensions.module.less";
import { AsyncHook } from "devtools/types/hooks";
import { Extension } from "devtools/types/normandyApi";
import { chunkBy } from "devtools/utils/helpers";
import { ApiPage } from "devtools/utils/normandyApi";

// default export
const ExtensionsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const extensions = useExtensionsPage(page);

  return (
    <>
      <div className="page-header align-items-baseline">
        <div className="flex-grow-1 text-right">
          <UploadWhisper />
        </div>
      </div>

      <div className="page-wrapper">
        <AsyncHookView<ApiPage<Extension>> hook={extensions}>
          {({ results: extensions }) => (
            <Grid className="extension-list w-100">
              {chunkBy(extensions, 2).map((extensionChunk, rowIdx) => (
                <Row key={`row-${rowIdx}`}>
                  {extensionChunk.map((extension, colIdx) => (
                    <Col key={`col-${colIdx}`} md={12} sm={24}>
                      <ExtensionCard key={extension.id} extension={extension} />
                    </Col>
                  ))}
                </Row>
              ))}
            </Grid>
          )}
        </AsyncHookView>

        <div>
          <Pagination
            boundaryLinks
            ellipsis
            first
            last
            next
            prev
            activePage={page}
            maxButtons={5}
            pages={Math.ceil((extensions.value?.count ?? 1) / 25)}
            size="lg"
            onSelect={setPage}
          />
        </div>
      </div>
    </>
  );
};

const ExtensionCard: React.FC<{ extension: Extension }> = ({ extension }) => {
  return (
    <Panel
      bordered
      className="extension-card mb-2"
      header={<ExtensionCardHeader extension={extension} />}
    >
      <dl className="d-flex flex-wrap m-0">
        <span className="flex-grow-1 d-inline-block flex-basis-half">
          <dt>Extension ID</dt>
          <dd>{extension.extension_id}</dd>
        </span>
        <span className="flex-grow-1 d-inline-block flex-basis-half">
          <dt>Version</dt>
          <dd>{extension.version}</dd>
        </span>
      </dl>
    </Panel>
  );
};

const ExtensionCardHeader: React.FC<{ extension: Extension }> = ({
  extension,
}) => {
  return (
    <div className="d-flex">
      <span className="flex-basis-0 flex-grow-0">
        <Tag className="mr-half" color="violet">
          {extension.id}
        </Tag>
      </span>
      <span className="flex-grow-1 pr-1">{extension.name}</span>
      <span>
        <a href={extension.xpi}>
          <Icon icon="download" />
        </a>
      </span>
    </div>
  );
};

function useExtensionsPage(page: number): AsyncHook<ApiPage<Extension>> {
  const [extensions, setExtensions] = useState<ApiPage<Extension>>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normandyApi = useSelectedNormandyEnvironmentAPI();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const newExtensions = await normandyApi.fetchExtensionsPage({ page });
        setExtensions(newExtensions);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [page]);

  if (error) {
    return { error, loading: false, value: null };
  } else if (loading) {
    return { error: null, loading: true, value: extensions };
  }

  return { value: extensions, loading: false, error: null };
}

const UploadWhisper: React.FC = () => {
  const whisper = useRef<WhisperInstance>();

  return (
    <Whisper
      ref={whisper}
      placement="auto"
      preventOverflow={true}
      speaker={<UploadPopover toClose={() => whisper.current?.close()} />}
      trigger="click"
    >
      <IconButton icon={<Icon icon="plus" />}>Upload Extension</IconButton>
    </Whisper>
  );
};

export type UploadPopoverProps = PopoverProps & {
  toClose: VoidFunction;
};

export const UploadPopover: React.FC<UploadPopoverProps> = ({
  className,
  toClose,
  ...popoverProps
}) => {
  const [fileList, setFileList] = useState<Array<FileType>>([]);
  const [name, setName] = useState<string>("");
  const normandyApi = useSelectedNormandyEnvironmentAPI();
  const [error, setError] = useState(null);
  const [state, setState] = useState<"editing" | "submitting" | "done">(
    "editing",
  );

  const handleSubmit = useCallback(async () => {
    try {
      setState("submitting");
      setError(null);
      await normandyApi.createExtension({ name, xpi: fileList?.[0]?.blobFile });
      setState("done");
      setTimeout(() => toClose(), 1500);
    } catch (err) {
      setError(err);
      setState("editing");
    }
  }, [fileList?.[0], name]);

  let { name: nameErrors = null, xpi: xpiErrors = null } = error?.data || {};
  if (nameErrors && !Array.isArray(nameErrors)) {
    nameErrors = [nameErrors];
  }

  if (xpiErrors && !Array.isArray(xpiErrors)) {
    xpiErrors = [xpiErrors];
  }

  return (
    <Popover
      {...popoverProps}
      className={cx([styles.uploadPopover, className])}
      data-testid="extension-upload-dialog"
    >
      <Form fluid disabled={state !== "editing" ? "disabled" : false}>
        <FormGroup controlId="xpi">
          <ControlLabel>XPI</ControlLabel>
          <FormControl
            required
            accept=".xpi"
            accepter={Uploader}
            autoUpload={false}
            fileList={fileList}
            id="xpi"
            multiple={false}
            onChange={(files) =>
              // Only keep the last file uploaded,
              setFileList(files.slice(files.length - 1, files.length))
            }
          />
          {xpiErrors &&
            xpiErrors.map((err, index) => (
              <p key={index} className="text-red">
                {err}
              </p>
            ))}
        </FormGroup>

        <FormGroup controlId="name">
          <ControlLabel>Name</ControlLabel>
          <FormControl required value={name} onChange={setName} />
          {nameErrors &&
            nameErrors.map((err, index) => (
              <p key={index} className="text-red">
                {err}
              </p>
            ))}
        </FormGroup>

        {error?.message && !xpiErrors && !nameErrors && (
          <p className="mb-2 mt-n1 text-red">{error.message}</p>
        )}

        {state === "done" ? (
          <>
            <Icon icon="check" title="Done" /> Created
          </>
        ) : (
          <FormGroup>
            <ButtonToolbar className="text-right">
              <Button appearance="default" onClick={toClose}>
                Cancel
              </Button>
              <Button
                appearance="primary"
                loading={state === "submitting"}
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </ButtonToolbar>
          </FormGroup>
        )}
      </Form>
    </Popover>
  );
};

export default ExtensionsPage;
