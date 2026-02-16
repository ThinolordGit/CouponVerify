import React from "react";
import { createRoot } from "react-dom/client";
import { I18nProvider } from "./context/I18nContext";
import { AdminProvider } from "./context/AdminContext";
import { ToastProvider } from "./context/ToastContext";
import { BrowserRouter } from 'react-router-dom';
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <I18nProvider>
    <AdminProvider>
      <ToastProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ToastProvider>
    </AdminProvider>
  </I18nProvider>
);
