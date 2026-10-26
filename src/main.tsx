import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Development-only inspection surface for browser acceptance tests.
import { useGameStore } from "./store/gameStore";
import { useStudioStore } from "./store/studioStore";
import { VideoRecorder } from "./game/recording/VideoRecorder";
if (import.meta.env.DEV)
  Object.assign(window, {
    gloopDebug: {
      game: useGameStore,
      studio: useStudioStore,
      recorder: VideoRecorder,
    },
  });
