import React from "react";
import ReactDOM from "react-dom/client";
import { Theme } from "@radix-ui/themes";
import { Provider } from "jotai";
import PageWindow from "./components/layout/PageWindow";
import "@radix-ui/themes/styles.css";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider>
      <Theme>
        <PageWindow />
      </Theme>
    </Provider>
  </React.StrictMode>
);
