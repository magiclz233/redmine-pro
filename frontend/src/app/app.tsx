import { HashRouter } from "react-router-dom";

import { AppFrame } from "@/app/app-frame";

export default function App() {
  return (
    <HashRouter>
      <AppFrame />
    </HashRouter>
  );
}
