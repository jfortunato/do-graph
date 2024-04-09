// The API does not return the CPU usage directly, but instead returns a bunch of individual cpu data that can be added together.
import { MetricDataResponse } from './api';
import { ChartResults } from './graph';

interface Dataset {
    totalCpu: number;
    idleCpu: number;
    timestamp: number;
}

function getCpuMetrics(data: MetricDataResponse, cpuCores: number, timeframe: number): ChartResults {
    let datapoints: number[] = [];
    let labels: string[] = [];

    const userValues = data.data.result.find((result) => result.metric.mode === 'user')!.values;
    const systemValues = data.data.result.find((result) => result.metric.mode === 'system')!.values;
    const stealValues = data.data.result.find((result) => result.metric.mode === 'steal')!.values;
    const softirqValues = data.data.result.find((result) => result.metric.mode === 'softirq')!.values;
    const niceValues = data.data.result.find((result) => result.metric.mode === 'nice')!.values;
    const irqValues = data.data.result.find((result) => result.metric.mode === 'irq')!.values;
    const iowaitValues = data.data.result.find((result) => result.metric.mode === 'iowait')!.values;
    const idleValues = data.data.result.find((result) => result.metric.mode === 'idle')!.values;

    const totalDatapoints = data.data.result[0].values.length;

    const dataset: Dataset[] = [];

    for (let i = 0; i < totalDatapoints; i++) {
        const user    =  parseFloat(userValues[i][1]);
        const system  =  parseFloat(systemValues[i][1]);
        const steal   =  parseFloat(stealValues[i][1]);
        const softirq =  parseFloat(softirqValues[i][1]);
        const nice    =  parseFloat(niceValues[i][1]);
        const irq     =  parseFloat(irqValues[i][1]);
        const iowait  =  parseFloat(iowaitValues[i][1]);
        const idle    =  parseFloat(idleValues[i][1]);

        const total = user + system + steal + softirq + nice + irq + iowait + idle;

        dataset.push({
            totalCpu: total,
            idleCpu: idle,
            timestamp: userValues[i][0],
        });
    }

    for (let i = 1; i < dataset.length; i++) {
        const totalCpuDiff = dataset[i].totalCpu - dataset[i - 1].totalCpu;
        const idleCpuDiff = dataset[i].idleCpu - dataset[i - 1].idleCpu;
        const timeDiff = dataset[i].timestamp - dataset[i - 1].timestamp;
        const cpuUsagePercent = ((totalCpuDiff - idleCpuDiff) / timeDiff) * 100;

        labels.push(timestampToLabel(dataset[i].timestamp, timeframe));
        datapoints.push(cpuUsagePercent / cpuCores);
    }

    return { labels, datapoints };
}

// The load average is much simpler since we can use the values directly
function getLoadMetrics(data: MetricDataResponse, timeframe: number): ChartResults {
    let datapoints: number[] = [];
    let labels: string[] = [];

    data.data.result[0].values.forEach((value) => {
        labels.push(timestampToLabel(value[0], timeframe));
        datapoints.push(parseFloat(value[1]));
    });

    return { labels, datapoints };
}

function timestampToLabel(timestamp: number, timeframe: number): string {
    // If timeframe is less than or equal to 24 hours, show time instead of date
    const opts: Intl.DateTimeFormatOptions = timeframe <= 86400 ?
        { hour: 'numeric', minute: 'numeric' } :
        { month: 'short', day: 'numeric' };

    return new Date(timestamp * 1000).toLocaleString('en-US', opts);
}

export { getCpuMetrics, getLoadMetrics };
