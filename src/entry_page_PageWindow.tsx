import PageWindow from "@/featuregroups/windows/page/PageWindow";
import React from "react";
import ReactDOM from "react-dom/client";

// biome-ignore lint/style/noNonNullAssertion: it's totally there
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PageWindow />
  </React.StrictMode>,
);

setTimeout(() => {
  document.body.classList.remove("notloaded");
}, 1000);
