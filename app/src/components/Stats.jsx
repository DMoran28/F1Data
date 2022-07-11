import React, { useState } from "react";

import Dropdown from "./Dropdown";
import BarChart from "./BarChart";
import LineChart from "./LineChart";
import "../styles/Stats.css";

const Stats = () => {
  // Seasons of Formula 1.
  function selectYearsFrom(start) {
    let data = [];
    const seasons = [
      ...Array(new Date().getFullYear() - start + 1).keys()
    ].map(i => i + start);

    let i = 1;
    for (const year of seasons.reverse()) {
      data.push({id: i++, value: year});
    }
    return data;
  }
  const seasons = selectYearsFrom(2018);

  // Auxiliary object.
  const compound_colors = {
    "#FF3333": "SOFT",
    "#FFF200": "MEDIUM",
    "#EBEBEB": "HARD",
    "#39B54A": "INTERMEDIATE",
    "#00AEEF": "WET",
    "gray": "UNKNOWN"
  }

  // States to control the dropdown and it's parameters.
  const [season, setSeason] = useState(0);
  const [tracks, setTracks] = useState([{ 
    id: 1, value: "Select a year first!" 
  }]);
  const [stats, setStats] = useState({});
  const [loadingTrack, setLoadingTrack] = useState(false);
  const [checkTrack, setCheckTrack] = useState(true);
  const [restartTrack, setRestartTrack] = useState(false);

  // States to check when the chart can be displayed on screen.
  const [displayChart, setDisplayChart] = useState(false);
  const [loadingChart, setLoadingChart] = useState(false);

  // Callback function to get the circuits of a given season.
  async function callbackSeason(year) {
    setSeason(year); // Set the year to the state.
    setDisplayChart(false); // Hide the chart.
    setTracks([{ id: 1, value: "Loading..." }]);
    setLoadingTrack(true); // Display the loading icon.
    setRestartTrack(!restartTrack); // Restart the value of the dropdown.
    
    // API call to get the list of grand prix of a given year.
    const response = await fetch(
      `http://127.0.0.1:8000/api/stats/${year}`
    ).then(res => res.json());
    setTracks(response); // Set the new list with the API call results.
    setLoadingTrack(false); // Hide the loading icon.
    setCheckTrack(false); // Check if any dropdown can change it's value.
  }

  // Callback function to get the stats of a race in a given season.
  async function callbackStats(circuit) {
    setDisplayChart(false) // Hide the chart.
    setLoadingChart(true) // Display the loading icon.

    // API call to get the stats of the grand prix of a given season.
    const response = await fetch(
      `http://127.0.0.1:8000/api/stats/${season}/${circuit}`
    ).then(res => res.json());
    setStats(response); // Set the object of stats with the API call results.
    setLoadingChart(false); // Hide the loading icon.
    setDisplayChart(true); // Display the charts.
  }

  return (
    <div className="container">
      <div className="container-title">
        <h1>Stats</h1>
        <h2>Select a grand prix of a season!</h2>
      </div>
      <div className="container-dropdown">
        <Dropdown
          title="Select year"
          items={seasons}
          callback={callbackSeason}
          loading={false}
          check={false}
          restart={false}
        />
        <Dropdown
          title="Select grand prix"
          items={tracks}
          callback={callbackStats}
          loading={loadingTrack}
          check={checkTrack}
          restart={restartTrack}
        />
      </div>
      {loadingChart && 
        <img 
          className="loading-chart"
          src={require("../img/soft-compound.png")}
          alt="Loading's icon"
        />
      }
      {displayChart && 
        <div className="container-chart">
          <h2 className="container-description">Qualifying Times</h2>
          <BarChart
            items={stats.qualiTimes.items}
            labels={stats.qualiTimes.labels}
            xlabel="Seconds (s)"
            ylabel="Drivers"
            tooltip={{
              label: (item) => { return `${item.formattedValue}s`; }
            }}
            stacked={false}
            axis={true}
            ticks={[
              Math.min(...stats.qualiTimes.items[0].data) - 2, 
              Math.max(...stats.qualiTimes.items[0].data)
            ]}
          />
          <h2 className="container-description">Race Strategy</h2>
          <BarChart
            items={stats.raceStrat.items}
            labels={stats.raceStrat.labels}
            xlabel="Number of laps"
            ylabel="Drivers"
            tooltip={{
              label: (item) => {
                const c = item.dataset.backgroundColor[item.dataIndex]
                return `${item.formattedValue} laps - ${compound_colors[c]}`;
              }
            }}
            stacked={true}
            axis={true}
            ticks={[0, stats.raceStrat.laps]}
          />
          <h2 className="container-description">Championship Points</h2>
          <LineChart
            labels={stats.chamPoints.labels}
            items={stats.chamPoints.items}
            xlabel="Grand Prixes"
            ylabel={"Number of points"}
            tooltip={{
              title: () => { return "Points" },
              label: (item) => {
                const surname = item.dataset.label.split(" ")[1];
                const abbr = surname.substring(0, 3).toUpperCase();
                return `${abbr} - ${item.formattedValue}`;
              }
            }}
            select={() => {}}
            pointBorderWidth={0}
            pointRadius={1}
            tickCallback={() => {}}
          />
        </div>
      }
    </div>
  );
};

export default Stats;
