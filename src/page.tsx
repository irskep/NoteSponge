import AppTheme from "@/components/AppTheme";
import PageWindow from "@/components/layout/PageWindow";
import { Provider, getDefaultStore } from "jotai";
import React from "react";
import ReactDOM from "react-dom/client";

// biome-ignore lint/style/noNonNullAssertion: it's totally there
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={getDefaultStore()}>
      <AppTheme>
        <PageWindow />
      </AppTheme>
    </Provider>
  </React.StrictMode>,
);

setTimeout(() => {
  document.body.classList.remove("notloaded");
}, 1000);
