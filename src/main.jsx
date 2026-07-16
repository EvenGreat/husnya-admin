import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { JoditProvider } from "./context/JoditContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <JoditProvider>
        <App />
      </JoditProvider>
    </BrowserRouter>
  </StrictMode>
);