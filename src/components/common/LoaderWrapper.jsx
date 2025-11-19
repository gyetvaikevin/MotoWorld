// src/components/LoaderWrapper.jsx
import React from "react";
import "./LoaderWrapper.css";

export default function LoaderWrapper({ text = "Loading..." }) {
  return (
    <div className="loader-wrapper">
      <img
        src="/motor-loading.png" // ide tedd be a sportmotoros képet
        alt="Sportmotor töltés közben"
        className="loader-image"
      />
      <p className="loader-text">{text}</p>
    </div>
  );
}
