import React from "react";
import { FallbackProps } from "react-error-boundary";
import { Icon, IconButton } from "rsuite";

export const ErrorFallbackPage: React.FC<FallbackProps> = ({
  error,
  componentStack,
  resetErrorBoundary,
}: FallbackProps) => {
  return (
    <div className="page-wrapper">
      <h5>Something went wrong!</h5>

      <p>
        <code>{error.message}</code>
      </p>

      <pre>{componentStack}</pre>

      <p className="mt-5">
        <IconButton icon={<Icon icon="refresh" />} onClick={resetErrorBoundary}>
          Try again
        </IconButton>
      </p>
    </div>
  );
};
