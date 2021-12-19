import React from "react";

import { LayoutProvider } from "devtools/contexts/layout";

interface PageWrapperProps {
  className?: string;
}

// default export
const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  className = "",
}) => {
  const [pageWrapper, setPageWrapper] = React.useState<HTMLElement>(null);

  return (
    <LayoutProvider container={pageWrapper}>
      <div
        ref={setPageWrapper}
        className={`page-wrapper position-relative ${className}`}
      >
        {children}
      </div>
    </LayoutProvider>
  );
};

export default PageWrapper;
