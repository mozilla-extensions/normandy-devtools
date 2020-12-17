import React from "react";

const NotFoundPage: React.FC = ({ children, ...otherProps }) => {
  return (
    <>
      <span>404</span>
      {children}
      <pre>
        <code>{JSON.stringify(otherProps, null, 4)}</code>
      </pre>
    </>
  );
};

export default NotFoundPage;
