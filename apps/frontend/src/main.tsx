import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app/App.tsx";
import { QueryProvider } from "./app/providers/QueryProvider";
import { AuthProvider } from "./app/providers/AuthProvider.tsx";
import { setGraphqlAuthTokenGetter } from "./lib/graphql/graphqlFetch";
import { getToken } from "./features/auth/tokenStorage";
import { BrowserRouter } from "react-router-dom";

setGraphqlAuthTokenGetter(getToken);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryProvider>
    </BrowserRouter>
  </StrictMode>,
);
