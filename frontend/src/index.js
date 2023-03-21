import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import ResProvider from "./components/ResContext";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
