import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import { Provider } from "./providers/ui-provider.tsx";
import "@/styles/globals.css";
import QueryProvider from "./providers/query-provider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryProvider>
      <BrowserRouter>
        <Provider>
          <main className="">
            {/* <Toaster
              toastOptions={{
                className: "bg-background text-foreground",
              }}
            /> */}
            <App />
          </main>
        </Provider>
      </BrowserRouter>
    </QueryProvider>
  </React.StrictMode>
);
