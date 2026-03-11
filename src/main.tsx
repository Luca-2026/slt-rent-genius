import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
// cache-bust: v2

createRoot(document.getElementById("root")!).render(<App />);
