import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app/App.tsx";
import { QueryProvider } from "./app/providers/QueryProvider";
import { ToastProvider } from "./app/providers/ToastProvider.tsx";
import { AuthProvider } from "./app/providers/AuthProvider.tsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ToastProvider>
      </QueryProvider>
    </BrowserRouter>
  </StrictMode>,
);
