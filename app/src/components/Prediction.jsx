// React dependencies.
import React, { useState } from "react";

// React components.
import Dropdown from "./Dropdown";
import Select from "./Select";
import BarChart from "./BarChart";

// Prediction styles.
import "../styles/Prediction.css";

// Prediction component.
const Prediction = () => {
  // Circuits to evaluate the trained model and predict the results of the
  // drivers.
  const circuits = [
    { id: 16, value: "São Paulo Grand Prix" },
    { id: 17, value: "Qatar Grand Prix" },
    { id: 18, value: "Saudi Arabian Grand Prix"},
    { id: 19, value: "Abu Dhabi Grand Prix"}
  ];

  // State to keep the information of the data.
  const [track, setTrack] = useState("");
  const [items, setItems] = useState({})

  // State to show the chart.
  const [displayChart, setDisplayChart] = useState(false);
  const [displaySelect, setDisplaySelect] = useState(false)
  const [loadingChart, setLoadingChart] = useState(false);

  async function selectCluster(item) {
    callbackPrediction(track, parseInt(item.substring(0, 1)));
  }

  async function callbackPrediction(circuit, cluster=2) {
    // Set the track.
    setTrack(circuit)

    // Display the select.
    setDisplaySelect(true);

    // Display the loading icon.
    setLoadingChart(true);

    // Hide the chart.
    setDisplayChart(false);

    // API call to get the list of the different session of a grand prix by a given year.
    const response = await fetch(
      `http://127.0.0.1:8000/api/prediction/${circuit}/${cluster}`
    ).then((res) => res.json());

    // Set the new list with the API call results. 
    setItems(response);

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
          title="Select grand prix"
          items={circuits}
          callback={callbackPrediction}
          loading={false}
          check={false}
          restart={false}
        />
      </div>
      {(displaySelect) &&
        <div className="container-chart">
          <Select 
            title="Select the model to show" 
            items={["2 clusters", "5 clusters"]}
            callback={selectCluster}
          />
        </div>
      }
      {loadingChart && 
        <img 
          className="loading-chart"
          src={require("../img/soft-compound.png")}
          alt="Loading's icon"
        />
      }
      {displayChart && (
        <div className="container-chart">
          <BarChart
            items={items.itemsPoints}
            labels={items.labelsPoints}
            xlabel="Accuracy (%)"
            ylabel="With Points"
            tooltip={{
              label: (item) => { return `${item.formattedValue}% of accuracy`; }
            }}
            stacked={false}
            axis={false}
          />
          <BarChart
            items={items.itemsNPoints}
            labels={items.labelsNPoints}
            xlabel="Accuracy (%)"
            ylabel="Without Points"
            tooltip={{
              label: (item) => { return `${item.formattedValue}% of accuracy`; }
            }}
            stacked={false}
            axis={true}
          />
        </div>
      )}
    </div>
  );
};

export default Prediction;
