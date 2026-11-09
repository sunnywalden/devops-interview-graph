import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LocalizedApp } from "./LocalizedApp";
import "./index.css";

createRoot(document.getElementById("root")!).render(<StrictMode><LocalizedApp /></StrictMode>);
