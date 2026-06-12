// src/components/GlobalSpinner.jsx
import React from "react";
import { useLoading } from "../context/LoadingContext";

const GlobalSpinner = () => {
  const { loading } = useLoading();

  if (!loading) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "4px",
        backgroundColor: "#3b82f6", // blue
        zIndex: 9999,
        animation: "spinner 1s linear infinite",
      }}
    />
  );
};

export default GlobalSpinner;
