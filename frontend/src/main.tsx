import React from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/jetbrains-mono";
import "material-symbols/outlined.css";

import App from "./App";
import { Providers } from "./app/providers";
import { bootstrapTheme } from "./stores/use-theme-store";
import "./style.css";

const container = document.getElementById("root");

if (!container) {
  throw new Error("Root container not found");
}

// 在 React 挂载前先同步主题，减少桌面端首屏闪烁。
bootstrapTheme();

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>
);
