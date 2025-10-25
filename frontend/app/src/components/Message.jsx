// src/components/Message.jsx
import React from "react";
import { Alert } from "react-bootstrap";

function Message({ variant = "info", children }) {
  if (!children) return null;

  return (
    <Alert
      variant={variant}
      className="text-center mt-3"
      style={{
        fontWeight: 500,
        fontSize: "0.95rem",
        borderRadius: "12px",
      }}
    >
      {children}
    </Alert>
  );
}

export default Message;
