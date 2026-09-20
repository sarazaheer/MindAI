import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import AdminContextProvider from "./context/AdminContext.jsx";
import DoctorContextProvder from "./context/DoctorContext.jsx";
import AppContextProvider from "./context/AppContext.jsx";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AdminContextProvider>
      <DoctorContextProvder>
        <AppContextProvider>
          <App />
        </AppContextProvider>
      </DoctorContextProvder>
    </AdminContextProvider>
  </BrowserRouter>
);
