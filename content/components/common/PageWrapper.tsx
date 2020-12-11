import React from "react";

import { LayoutProvider } from "devtools/contexts/layout";

// default export
const PageWrapper: React.FC = ({ children }) => {
  const [pageWrapper, setPageWrapper] = React.useState<HTMLElement>(null);

  return (
    <LayoutProvider container={pageWrapper}>
      <div ref={setPageWrapper} className="page-wrapper position-relative">
        {children}
      </div>
    </LayoutProvider>
  );
};

export default PageWrapper;
