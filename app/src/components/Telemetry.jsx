// React dependencies.
import React, { useState } from "react";

// React components.
import Dropdown from "./Dropdown";
import Select from "./Select";
import LineChart from "./LineChart";

// Telemetry styles.
import "../styles/Telemetry.css";

// Telemetry component.
function Telemetry() {
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
  const [gp, setGp] = useState("");
  const [session, setSession] = useState("");
  const [driver, setDriver] = useState("");

  // States to update the list when the API call change.
  const [gps, setGps] = useState([{ id: 1, value: "Select a year first!" }]);
  const [sessions, setSessions] = useState([
    { id: 1, value: "Select a grand prix first!" },
  ]);
  const [drivers, setDrivers] = useState([
    { id: 1, value: "Select a season first!" },
  ]);

  // States to update the status of the API call.
  const [loadingGps, setLoadingGps] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [loadingTelemetry, setLoadingTelemetry] = useState(false)

  // States to check if the API call of the last element is done.
  const [checkYear, setCheckYear] = useState(true);
  const [checkGp, setCheckGp] = useState(true);
  const [checkSession, setCheckSession] = useState(true);

  // States to restart the selection of the dropdown.
  const [restartGps, setRestartGps] = useState(false);
  const [restartSessions, setRestartSessions] = useState(false);
  const [restartDrivers, setRestartDrivers] = useState(false);

  // State to save the dataset of the chart.
  const [timeDataset, setTimeDataset] = useState({labels: [], scores: [], driver: "", color: ""});
  const [telemetryDataset, setTelemetryDataset] = useState({labels: [], scores: [], driver: "", color: ""})

  // State to show the chart.
  const [displayChart, setDisplayChart] = useState(false);
  const [loadingChart, setLoadingChart] = useState(false);

  // State to show the telemetry.
  const [displayTelemetry, setDisplayTelemetry] = useState(false);
  const [lap, setLap] = useState(0);

  const units = {Speed: "km/h", Throttle: "%", nGear: "#", RPM: "#"};
  const [type, setType] = useState("");

  // Callback functions.
  async function callbackYear(_year) {
    // Set the year to the state.
    setYear(_year);

    // Hide the chart.
    setDisplayChart(false);

    // Hide the telemetry.
    setDisplayTelemetry(false);
    
    // Set the items of the different dropdowns.
    setGps([{ id: 1, value: "Loading..." }]);
    setSessions([{ id: 1, value: "Select a grand prix first!" }]);
    setDrivers([{ id: 1, value: "Select a session first!" }]);

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
    setCheckGp(true);
    setCheckSession(true);
  }

  async function callbackGp(_gp) {
    // Set the gp to the state.
    setGp(_gp);

    // Hide the chart.
    setDisplayChart(false);

    // Hide the telemetry.
    setDisplayTelemetry(false);

    // Set the items of the different dropdowns.
    setSessions([{ id: 1, value: "Loading..." }]);
    setDrivers([{ id: 1, value: "Select a session first!" }]);

    // Set the loading icon.
    setLoadingSessions(true);

    // Restart the selected value of the dropdown.
    setRestartSessions(!restartSessions);

    // API call to get the list of the different session of a grand prix by a given year.
    const response = await fetch(
      "http://127.0.0.1:8000/api/schedule/" + year + "/" + _gp
    ).then((res) => res.json());

    // Set the new list with the API call results.
    setSessions(response);

    // Hide the loading icon.
    setLoadingSessions(false);

    // Check if any dropdown can change it's value.
    setCheckGp(false);
    setCheckSession(true);
  }

  async function callbackSession(_session) {
    // Set the gp to the state.
    setSession(_session);

    // Hide the chart.
    setDisplayChart(false);

    // Hide the telemetry.
    setDisplayTelemetry(false);

    // Set the items of the different dropdowns.
    setDrivers([{ id: 1, value: "Loading..." }]);

    // Set the loading icon.
    setLoadingDrivers(true);

    // Restart the selected value of the dropdown.
    setRestartDrivers(!restartDrivers);

    // API call to get the list of the different drivers in a given session of a grand prix by a given year.
    const response = await fetch(
      "http://127.0.0.1:8000/api/schedule/" + year + "/" + gp + "/" + _session
    ).then((res) => res.json());

    // Set the new list with the API call results.
    setDrivers(response);

    // Hide the loading icon.
    setLoadingDrivers(false);

    // Check if any dropdown can change it's value.
    setCheckSession(false);
  }

  async function callbackDriver(_driver) {
    // Set the driver.
    setDriver(_driver);

    // Hide the chart.
    setDisplayChart(false);

    // Hide the telemetry.
    setDisplayTelemetry(false);

    // Set the loading icon.
    setLoadingChart(true);

    // API call to get the laptime of a driver in a given session of a grand prix by a given year.
    const response = await fetch(
      "http://127.0.0.1:8000/api/schedule/" + year + "/" + gp + "/" + session + "/" + _driver
    ).then((res) => res.json());

    // Set the new dataset of the chart.
    setTimeDataset(response);

    // Hide the loading icon.
    setLoadingChart(false);
    
    // Display the chart.
    setDisplayChart(true);
  }
  
  async function callbackTelemetry(item, _lap) {
    // Set the type of telemetry.
    setType(item);

    // Display loading icon.
    setLoadingTelemetry(true);

    // Hide the chart.
    setDisplayTelemetry(false);

    // Set the lap.
    if (_lap === undefined) _lap = lap;

    // API call to get the telemetry of a driver in a given session of a grand prix by a given year.
    const response = await fetch(
      "http://127.0.0.1:8000/api/telemetry/" + year + "/" + gp + "/" + session + "/" + driver + "/" + _lap + "/" + item
    ).then((res) => res.json());

    // Set the new dataset of the chart.
    setTelemetryDataset(response);

    // Display the telemetry chart.
    setDisplayTelemetry(true);
    
    // Hide the loading icon.
    setLoadingTelemetry(false);
  }

  async function selectLap(item) {
    // Set the lap
    setLap(item.label);

    // Callback to the API for the data.
    callbackTelemetry("Speed", item.label);
  }

  return (
    <div className="container">
      <div className="container-title">
        <h1>Telemetry</h1>
        <h2>Select the driver from a session!</h2>
      </div>
      <div className="container-dropdown">
        <div className="dropdown-container">
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
        <div className="dropdown-container">
          <Dropdown
            title="Select session"
            items={sessions}
            callback={callbackSession}
            loading={loadingSessions}
            check={checkGp}
            restart={restartSessions}
          />
          <Dropdown
            title="Select driver"
            items={drivers}
            callback={callbackDriver}
            loading={loadingDrivers}
            check={checkSession}
            restart={restartDrivers}
          />
        </div>
      </div>
      {loadingChart && 
        <img 
          className="loading-chart"
          src={require("../img/soft-compound.png")}
          alt="Loading's icon"
        />
      }
      <div className={
        `container-chart ${displayChart ? "" : "hide-container"}`
      }>
        <LineChart
          labels={timeDataset.labels}
          items={timeDataset.items}
          xlabel="Number of laps"
          ylabel="Seconds (s)"
          tooltip={{
            title: (item) => { return item[0].dataset.label; },
            label: (item) => {
              return `Lap ${item.label}: ${item.formattedValue}s`;
            }
          }}
          select={selectLap}
          pointBorderWidth={1}
          pointRadius={4}
          tickCallback={() => {}}
        />
      </div>
      {(displayTelemetry || loadingTelemetry) &&
        <div className="container-chart">
          <span className="telemetry-container-span">Lap {lap}</span>
          <Select 
            title="Select the data to show" 
            items={Object.keys(units)}
            callback={callbackTelemetry}
          />
          {loadingTelemetry && (
            <div className="telemetry-loading-container"> 
              <img 
                className="loading-chart"
                src={require("../img/soft-compound.png")}
                alt="Loading's icon" 
              />
            </div>
          )}
        </div>
      }
      {displayTelemetry && (
        <div className="container-chart" id="telemetry">
          <LineChart
            labels={telemetryDataset.labels}
            items={telemetryDataset.items}
            xlabel="Track length (m)"
            ylabel={`${type} (${units[type]})`}
            tooltip={{
              title: (item) => { return item[0].dataset.label; },
              label: (item) => {
                return `${item.formattedValue}${units[type]}`;
              }
            }}
            select={() => {}}
            pointBorderWidth={0}
            pointRadius={1}
            tickCallback={() => {}}
          />
        </div>
      )}
    </div>
  );
}

export default Telemetry;
