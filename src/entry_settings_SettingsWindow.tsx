import SettingsWindow from "@/featuregroups/windows/settings/SettingsWindow";
import React from "react";
import ReactDOM from "react-dom/client";
import "@radix-ui/themes/styles.css";
import "@/styles/index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <SettingsWindow />
  </React.StrictMode>,
);
