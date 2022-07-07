// React and ChartJS dependencies.
import React, { useState } from "react";
import { Bar } from "react-chartjs-2";

// ChartJS tools.
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { useEffect } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function BarChart(props) {
  const [data, setData] = useState({
    labels: [],
    datasets: [{ data: [] }]
  });

  const [options, setOptions] = useState({});

  useEffect(() => {
    setData({
      labels: props.labels,
      datasets: props.items
    });
    
    setOptions({
      barThickness: 30,
      indexAxis: 'y',
      elements: { bar: { borderWidth: 2} },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1e2431",
          titleFont: { family: "F1Bold" },
          bodyFont: { family: "F1Regular" },
          borderColor: "rgba(255,255,255,0.7)",
          borderWidth: 1,
          callbacks: {
            title: (item) => { return item[0].label; }, 
            ...props.tooltip
          }
        },
      },
      scales: {
        x: {
          stacked: props.stacked,
          min: 50,
          max: 100,
          title: {
            display: props.axis,
            color: "rgba(255, 255, 255, 0.6)",
            text: props.xlabel,
            font: { family: "F1Regular" }
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
            borderDash: [10, 10]
          },
          ticks: {
            display: props.axis,
            color: "rgba(255, 255, 255, 0.7)",
            font: { size: 12, family: "F1Regular"}
          }
        },
        y: {
          title: {
            display: true,
            color: "rgba(255, 255, 255, 0.6)",
            text: props.ylabel,
            font: { family: "F1Regular"}
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
            borderDash: [10, 10]
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
            font: { size: 12, family: "F1Regular"},
            callback: (index) => {
              const surname = props.labels[index].split(" ")[1];
              return surname.substring(0, 3).toUpperCase();
            }
          }
        }
      },
    });
  }, [props.item]);

  return (
    <Bar data={data} options={options} />
  );
}

export default BarChart;