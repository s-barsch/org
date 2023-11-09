import React from 'react';
import { monthObj } from './main';
import {
    Chart,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
  import { Bar } from 'react-chartjs-2';
  
  Chart.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

export default function TimeChart({months}: {months: monthObj[]}) {
    if (months === null) {
        return <></>;
    }
    const options = {
        responsive: true,
        aspectRatio: 4,
        animation: {
            duration: 0,
        },
        legend: {
            display: false,
        },
        plugins: {
            tooltip: {
                enabled: true,
            }
        }
    }
    const data = {
        labels: months.map(month => month.key),
        datasets: [
            {
                data: months.map(month => month.count),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
        ],
    };

    return <Bar options={options} data={data} />;
}