import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { UnpaidOrdersProvider } from "./context/UnpaidOrdersContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UnpaidOrdersProvider>
      <App />
    </UnpaidOrdersProvider>
  </StrictMode>
);
