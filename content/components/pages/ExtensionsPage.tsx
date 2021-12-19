import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Divider, Icon, IconButton, Pagination, Panel, Tag } from "rsuite";

import AsyncHookView from "devtools/components/common/AsyncHookView";
import PageWrapper from "devtools/components/common/PageWrapper";
import {
  useEnvironmentState,
  useSelectedNormandyEnvironmentAPI,
} from "devtools/contexts/environment";
import { AsyncHook } from "devtools/types/hooks";
import { Extension } from "devtools/types/normandyApi";
import { ApiPage } from "devtools/utils/normandyApi";

// default export
const ExtensionsPage: React.FC = () => {
  const { selectedKey: environmentKey } = useEnvironmentState();
  const [page, setPage] = useState(1);
  const extensions = useExtensionsPage(page);

  return (
    <div className="d-flex flex-column h-100">
      <div className="page-header">
        <div className="flex-grow-1" />
        <div className="d-flex align-items-center text-right">
          <IconButton
            appearance="subtle"
            className="ml-1"
            componentClass={Link}
            icon={<Icon icon="plus" />}
            to={`/${environmentKey}/extensions/new`}
          >
            Upload Extension
          </IconButton>
        </div>
      </div>

      <div className="flex-grow-1 overflow-auto">
        <PageWrapper>
          <AsyncHookView<ApiPage<Extension>> hook={extensions}>
            {({ results }) => (
              <div className="grid-layout grid-2 card-grid">
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

export default ExtensionsPage;
