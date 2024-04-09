// The base URL for the DigitalOcean API
const BASE_URL = 'https://api.digitalocean.com/v2';

// The metrics we can fetch from the API
export type Metric = 'cpu' | 'load_1';


// The response from the DigitalOcean API when fetching droplet information
export interface DropletInfoResponse {
  droplet: {
    vcpus: number;
  }
}

// The response from the DigitalOcean API when fetching metrics data
export interface MetricDataResponse {
  data: {
    result: {
      metric: {
        mode: string;
      };
      values: MetricValue[];
    }[];
  };
}

type MetricValue = [number, string];

// Get droplet information from DigitalOcean API, needed to get the number of CPU cores
async function getDropletInfo(token: string, dropletId: string): Promise<DropletInfoResponse> {
    const url = `${BASE_URL}/droplets/${dropletId}`;

    return makeRequest(url, token);
}

// Get the number of CPU cores from the droplet information, and cache it in session storage
// so we don't have to make the request every time.
export async function getNumberOfCpuCores(token: string, dropletId: string): Promise<number> {
  const key = `cpu-cores-${dropletId}`;
  const cachedCores = sessionStorage.getItem(key);

  if (cachedCores) {
    return parseInt(cachedCores);
  }

  const dropletInfo = await getDropletInfo(token, dropletId);
  const cpuCores = dropletInfo.droplet.vcpus;

  sessionStorage.setItem(key, cpuCores.toString());

  return cpuCores;
}

// Get metrics data from DigitalOcean API
export async function getData(token: string, metric: Metric, dropletId: string, timeframe: number): Promise<MetricDataResponse> {
  // The api expects a unix timestamp in seconds
  const now = Math.floor(Date.now() / 1000)
  const start = now - timeframe;

  const url = `${BASE_URL}/monitoring/metrics/droplet/${metric}?host_id=${dropletId}&start=${start}&end=${now}`;

  return makeRequest(url, token);
}

async function makeRequest(url: string, token: string): Promise<any> {
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
