import Chart from 'chart.js/auto';
import {getCpuMetrics, getLoadMetrics} from './metrics.js'

// Get metrics data from DigitalOcean API
async function getData(token, metric, dropletId, timeframe) {
    // The api expects a unix timestamp in seconds
    const now = Math.floor(Date.now() / 1000)
    const start = now - timeframe;

    const url = `https://api.digitalocean.com/v2/monitoring/metrics/droplet/${metric}?host_id=${dropletId}&start=${start}&end=${now}`;

    const response = await fetch(url, {
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
        }
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    return response.json();
}

// Display the chart using Chart.js
async function displayChart(data, cpuCores, timeframe) {
    const isCpuMetric = data.data.result[0].metric.mode === 'idle';

    const results = isCpuMetric ?
        getCpuMetrics(data, cpuCores, timeframe) :
        getLoadMetrics(data, timeframe);

    const container = document.getElementById('chart-container');
    const ctx = document.createElement('canvas');
    container.innerHTML = '';
    container.appendChild(ctx);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: results.labels,
            datasets: [{
                label: isCpuMetric ? 'CPU Usage' : '1 Minute Load Average',
                data: results.datapoints,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: isCpuMetric ? 100 : undefined,
                }
            },
            fill: true,
            pointStyle: false,
        }
    });
}

// Populate token & droplet ID if they exist in the url query string
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const dropletId = urlParams.get('droplet');

if (token) {
    document.getElementById("token").value = token;
}

if (dropletId) {
    document.getElementById("droplet").value = dropletId;
}

document.getElementById("inputs-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const metric = document.getElementById("metric").value;
    const timeframe = parseInt(document.getElementById("timeframe").value);
    const token = document.getElementById("token").value;
    const dropletId = document.getElementById("droplet").value;
    const cpuCores = parseInt(document.getElementById("cpu-cores").value);

    let data;
    try {
        data = await getData(token, metric, dropletId, timeframe);
    } catch (error) {
        alert("Could not fetch data from DigitalOcean API");

        return;
    }

    displayChart(data, cpuCores, timeframe);
});
