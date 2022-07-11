// React and ChartJS dependencies.
import React, { useState, useEffect } from "react";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// BarChart component.
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
      maintainAspectRatio: false,
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
          min: props.ticks[0],
          max: props.ticks[1],
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
          stacked: props.stacked,
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
    <Bar className="chart" data={data} options={options} />
  );
}

export default BarChart;