import cx from "classnames";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  ButtonToolbar,
  ControlLabel,
  Divider,
  Form,
  FormControl,
  FormGroup,
  Icon,
  IconButton,
  Pagination,
  Panel,
  Popover,
  PopoverProps,
  Tag,
  Uploader,
  Whisper,
} from "rsuite";
import { FileType } from "rsuite/lib/Uploader";
import { WhisperInstance } from "rsuite/lib/Whisper";

import AsyncHookView from "devtools/components/common/AsyncHookView";
import PageWrapper from "devtools/components/common/PageWrapper";
import { useSelectedNormandyEnvironmentAPI } from "devtools/contexts/environment";
import styles from "devtools/less/extensions.module.less";
import { AsyncHook } from "devtools/types/hooks";
import { Extension } from "devtools/types/normandyApi";
import { ApiPage } from "devtools/utils/normandyApi";

// default export
const ExtensionsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const extensions = useExtensionsPage(page);

  return (
    <div className="d-flex flex-column h-100">
      <div className="page-header">
        <div className="flex-grow-1" />
        <div className="d-flex align-items-center text-right">
          <UploadWhisper />
        </div>
      </div>

      <div className="flex-grow-1 overflow-auto">
        <PageWrapper>
          <AsyncHookView<ApiPage<Extension>> hook={extensions}>
            {({ results }) => (
              <div
                className="grid-layout grid-2 card-grid"
                data-testid="extensions-list"
              >
                {results.map((extension) => (
                  <ExtensionCard key={extension.id} extension={extension} />
                ))}
              </div>
            )}
          </AsyncHookView>
        </PageWrapper>
      </div>

      <div className="page-footer text-center">
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
  );
};

const ExtensionCard: React.FC<{ extension: Extension }> = ({ extension }) => {
  return (
    <Panel bordered className="extension-card mb-2">
      <div className="d-flex font-size-larger">
        <div>
          <Tag className="mt-0 mr-1" color="violet">
            {extension.id}
          </Tag>
        </div>
        <div className="font-weight-bold flex-grow-1">{extension.name}</div>
        <div className="ml-1 text-right">
          <a href={extension.xpi}>
            <Icon icon="download" />
          </a>
        </div>
      </div>

      <Divider />

      <div>
        <div className="font-weight-bold">Extension ID</div>
        <div className="text-subtle font-family-monospace">
          {extension.extension_id}
        </div>
      </div>
      <div className="mt-2">
        <div className="font-weight-bold">Version</div>
        <div className="text-subtle font-family-monospace">
          {extension.version}
        </div>
      </div>
    </Panel>
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
