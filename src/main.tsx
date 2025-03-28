import App from "@/components/layout/App";
import React from "react";
import ReactDOM from "react-dom/client";
import "@radix-ui/themes/styles.css";
import "@/styles/index.css";
import AppTheme from "@/components/AppTheme";
import { Provider, getDefaultStore } from "jotai";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={getDefaultStore()}>
      <AppTheme>
        <App />
      </AppTheme>
    </Provider>
  </React.StrictMode>,
);
