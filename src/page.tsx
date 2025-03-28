import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "jotai";
import PageWindow from "@/components/layout/PageWindow";
import AppTheme from "@/components/AppTheme";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider>
      <AppTheme>
        <PageWindow />
      </AppTheme>
    </Provider>
  </React.StrictMode>
);
