// React dependencies.
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

// React components.
import Header from "./components/Header";
import Telemetry from "./components/Telemetry";
import Stats from "./components/Stats";
import Prediction from "./components/Prediction";

// Main styles.
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router>
    <div className="app">
      <Header items={["Stats", "Prediction"]} />
      <Routes>
        <Route exact path="/" element={<Telemetry />} />
        <Route exact path="/stats" element={<Stats />} />
        <Route exact path="/prediction" element={<Prediction />} />
      </Routes>
    </div>
  </Router>
);
