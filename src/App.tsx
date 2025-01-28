import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import "./App.css";
import Page from "./Page";

function App() {
  const [pageID, setPageID] = useState(0);

  // async function greet() {
  //   // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  //   setGreetMsg(await invoke("greet", { name }));
  // }

  return (
    <main className="App">
      <Page id={pageID} key={pageID} />
    </main>
  );
}

export default App;
