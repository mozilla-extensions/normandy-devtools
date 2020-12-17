import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Col,
  Grid,
  Header,
  Icon,
  Nav,
  Navbar,
  Pagination,
  Panel,
  Row,
  Tag,
} from "rsuite";

import AsyncHookView from "devtools/components/common/AsyncHookView";
import {
  useEnvironmentState,
  useSelectedNormandyEnvironmentAPI,
} from "devtools/contexts/environment";
import { AsyncHook } from "devtools/types/hooks";
import { Extension } from "devtools/types/normandyApi";
import { chunkBy } from "devtools/utils/helpers";
import { ApiPage } from "devtools/utils/normandyApi";

// default export
const ExtensionsPage: React.FC = () => {
  const { selectedKey: environmentKey } = useEnvironmentState();
  const [page, setPage] = useState(1);
  const extensions = useExtensionsPage(page);

  return (
    <>
      <Header>
        <Navbar>
          <Nav pullRight>
            <Nav.Item
              componentClass={Link}
              icon={<Icon icon="plus" />}
              to={`/${environmentKey}/extensions/new`}
            >
              Upload Extension
            </Nav.Item>
          </Nav>
        </Navbar>
      </Header>

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

export default ExtensionsPage;
