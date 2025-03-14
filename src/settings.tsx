import React from "react";
import ReactDOM from "react-dom/client";
import { Settings } from "./components/settings/Settings";
import "@radix-ui/themes/styles.css";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Settings />
  </React.StrictMode>
);
