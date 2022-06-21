// React and ChartJS dependencies.
import React, { useState, useRef } from "react";
import { Line, getElementAtEvent } from "react-chartjs-2";

// ChartJS tools.
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useEffect } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function LineChart(props) {
  const [data, setData] = useState({
    labels: [],
    datasets: [{ data: [] }]
  });

  const [options, setOptions] = useState({});

  useEffect(() => {
    setData({
      labels: props.item.labels,
      datasets: [{ label: props.item.driver, data: props.item.scores, tension: 0.3 }]
    });
    setOptions({
      pointBorderColor: "rgb(255, 255, 255)",
      pointBorderWidth: props.pointBorderWidth === undefined ? 1 : props.pointBorderWidth,
      pointRadius: props.pointRadius === undefined ? 4 : props.pointRadius,
      pointHoverRadius: 10,
      pointHoverBorderWidth: 3,
      borderColor: props.item.color,
      spanGaps: true,
      pointBackgroundColor: props.item.color,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: "#1e2431",
          titleFont: {
            family: "F1Bold"
          },
          bodyFont: {
            family: "F1Regular"
          },
          borderColor: "rgba(255,255,255,0.7)",
          borderWidth: 1,
          callbacks: props.callbacks
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            color: "rgba(255, 255, 255, 0.6)",
            text: props.xlabel,
            font: {
              family: "F1Regular"
            }
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
            font: {
              size: 12,
              family: "F1Regular"
            }
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
            borderDash: [10, 10]
          }
        },
        y: {
          title: {
            display: true,
            color: "rgba(255, 255, 255, 0.6)",
            text: props.ylabel,
            font: {
              family: "F1Regular"
            }
          },
          ticks: {
            color: "rgba(255, 255, 255, 0.7)",
            font: {
              size: 12,
              family: "F1Regular"
            }
          },
          grid: {
            color: "rgba(255, 255, 255, 0.1)",
            borderDash: [10, 10]
          }
        }
      }
    });
  }, [props.item]);
  
  const chartRef = useRef();
  const onClick = (event) => {
    const element = getElementAtEvent(chartRef.current, event);
    if (!element.length) return;
    const { datasetIndex, index } = element[0];
    props.select({label: data.labels[index], data: data.datasets[datasetIndex].data[index]});
  };

  return (
    <Line ref={chartRef} data={data} options={options} onClick={onClick} />
  );
}

export default LineChart;
