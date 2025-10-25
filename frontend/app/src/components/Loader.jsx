// src/components/Loader.jsx
import React from "react";
import { Spinner } from "react-bootstrap";

function Loader({ size = "md", text = "Loading..." }) {
  const spinnerSize = size === "sm" ? "1rem" : size === "lg" ? "3rem" : "2rem";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "150px",
      }}
    >
      <Spinner
        animation="border"
        role="status"
        style={{ width: spinnerSize, height: spinnerSize, marginBottom: "10px" }}
      />
      <span className="text-muted">{text}</span>
    </div>
  );
}

export default Loader;
