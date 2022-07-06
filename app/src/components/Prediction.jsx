// React dependencies.
import React, { useState } from "react";

// React components.
import Dropdown from "./Dropdown";
import Select from "./Select";
import Chart from "./Chart";

// Prediction styles.
import "../styles/Prediction.css";

// Prediction component.
const Prediction = () => {
  // Seasons of Formula 1.
  function selectYearsFrom(start) {
    let data = [];
    const seasons = [...Array(new Date().getFullYear() - start + 1).keys()].map(i => i + start);

    let i = 1;
    for (const year of seasons.reverse()) {
      data.push({id: i++, value: year});
    }

    return data;
  }
  const years = selectYearsFrom(2018);

  // States to save the parameters of the API call.
  const [year, setYear] = useState(0);

  // States to update the list when the API call change.
  const [gps, setGps] = useState([{ id: 1, value: "Select a year first!" }]);

  // States to update the status of the API call.
  const [loadingGps, setLoadingGps] = useState(false);

  // States to check if the API call of the last element is done.
  const [checkYear, setCheckYear] = useState(true);

  // States to restart the selection of the dropdown.
  const [restartGps, setRestartGps] = useState(false);

  // State to show the chart.
  const [displayChart, setDisplayChart] = useState(false);
  const [loadingChart, setLoadingChart] = useState(false);

  // Callback functions.
  async function callbackYear(_year) {
    // Set the year to the state.
    setYear(_year);

    // Hide the chart.
    setDisplayChart(false);
    
    // Set the items of the different dropdowns.
    setGps([{ id: 1, value: "Loading..." }]);

    // Set the loading icon.
    setLoadingGps(true);

    // Restart the selected value of the dropdown.
    setRestartGps(!restartGps);

    // API call to get the list of grand prix of a given year.
    const response = await fetch(
      "http://127.0.0.1:8000/api/schedule/" + _year
    ).then((res) => res.json());

    // Set the new list with the API call results.
    setGps(response);

    // Hide the loading icon.
    setLoadingGps(false);

    // Check if any dropdown can change it's value.
    setCheckYear(false);
  }

  async function callbackGp(_gp) {
    // Display the loading icon.
    setLoadingChart(true);

    // Hide the chart.
    setDisplayChart(false);

    // API call to get the list of the different session of a grand prix by a given year.
    const response = await fetch(
      "http://127.0.0.1:8000/api/schedule/" + year + "/" + _gp
    ).then((res) => res.json());

    // Set the new list with the API call results. 
    // PONER LOS DATOS EN EL DATASET
    // setSessions(response);

    // Hide the loading icon.
    setLoadingChart(false);
    
    // Display the chart.
    setDisplayChart(true);
  }

  return (
    <div className="container">
      <div className="container-title">
        <h1>Prediction</h1>
        <h2>Select the qualifying session of a grand prix!</h2>
      </div>
      <div className="container-dropdown">
        <Dropdown
          title="Select year"
          items={years}
          callback={callbackYear}
          loading={false}
          check={false}
          restart={false}
        />
        <Dropdown
          title="Select grand prix"
          items={gps}
          callback={callbackGp}
          loading={loadingGps}
          check={checkYear}
          restart={restartGps}
        />
      </div>
    </div>
  );
};

export default Prediction;
