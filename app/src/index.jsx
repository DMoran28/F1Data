// React dependencies.
import React from "react";
import ReactDOM from "react-dom/client";

// App dependencies.
import "./index.css";
import App from "./components/App";

// Fonts dependencies.
import "./fonts/Formula1-Black.ttf";
import "./fonts/Formula1-Bold.ttf";
import "./fonts/Formula1-Regular.ttf";
import "./fonts/Formula1-Wide.ttf";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
