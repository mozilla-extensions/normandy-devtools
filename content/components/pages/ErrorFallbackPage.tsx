import React from "react";
import { FallbackProps } from "react-error-boundary";
import { Icon, IconButton } from "rsuite";

import PageWrapper from "devtools/components/common/PageWrapper";

export const ErrorFallbackPage: React.FC<FallbackProps> = ({
  error,
  resetErrorBoundary,
}: FallbackProps) => {
  return (
    <PageWrapper>
      <h5>Something went wrong!</h5>

      <p>
        <code>{error.message}</code>
      </p>

      {error.stack && <pre>{error.stack}</pre>}

      <p className="mt-5">
        <IconButton icon={<Icon icon="refresh" />} onClick={resetErrorBoundary}>
          Try again
        </IconButton>
      </p>
    </PageWrapper>
  );
};
