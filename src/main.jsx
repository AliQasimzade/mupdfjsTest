import { createRoot } from "react-dom/client";
import App from "./App.jsx";

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
      <App />
  );
} else {
  console.error("Root element not found. Check if the element with ID 'root' exists in your HTML.");
}
