import "./lib/browserStorage";
import "./lib/chunkLoadRecovery";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n";
import App from "./App.tsx";
import { adoptSeoHead } from "./lib/seoHeadOwnership";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root container not found");
}

const root = createRoot(rootElement);
adoptSeoHead();
root.render(<App />);
