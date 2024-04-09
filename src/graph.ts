import { getCpuMetrics, getLoadMetrics } from './metrics';
import Chart from 'chart.js/auto';
import { DropletInfoResponse, MetricDataResponse } from './api';

export interface ChartResults {
  labels: string[];
  datapoints: number[];
}

// Display the chart using Chart.js
export function displayChart(container: HTMLDivElement, data: MetricDataResponse, dropletInfo: DropletInfoResponse, timeframe: number): void {
  const isCpuMetric = data.data.result[0].metric.mode === 'idle';

  const dropletName = dropletInfo.droplet.name;
  const cpuCores = dropletInfo.droplet.vcpus;

  const results = isCpuMetric ?
    getCpuMetrics(data, cpuCores, timeframe) :
    getLoadMetrics(data, timeframe);

  const ctx = document.createElement('canvas');
  container.innerHTML = '';
  container.appendChild(ctx);

  const options: any = {
    scales: {
      y: {
        beginAtZero: true,
        max: isCpuMetric ? 100 : undefined,
      }
    },
    fill: true,
    pointStyle: false,
  }

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: results.labels,
      datasets: [{
        label: `${dropletName} - ${isCpuMetric ? 'CPU Usage' : '1 Minute Load Average'}`,
        data: results.datapoints,
        borderWidth: 1
      }]
    },
    options: options,
  });
}
