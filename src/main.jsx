import "graphql";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import ApolloProvider from "./ApolloProvider.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* <ApolloProvider>
    </ApolloProvider> */}
      <App />
  </StrictMode>
);
