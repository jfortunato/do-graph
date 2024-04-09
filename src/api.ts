// The base URL for the DigitalOcean API
const BASE_URL = 'https://api.digitalocean.com/v2';

// The metrics we can fetch from the API
export type Metric = 'cpu' | 'load_1';


// The response from the DigitalOcean API when fetching droplet information
export interface DropletInfoResponse {
  droplet: {
    name: string;
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
export async function getDropletInfo(token: string, dropletId: string): Promise<DropletInfoResponse> {
  // Return cached info if we have it in session storage
  const key = `droplet-info-${dropletId}`;
  const cachedInfo = sessionStorage.getItem(key);

  if (cachedInfo) {
    return JSON.parse(cachedInfo);
  }

  const url = `${BASE_URL}/droplets/${dropletId}`;

  const dropletInfo: DropletInfoResponse = await makeRequest(url, token);

  sessionStorage.setItem(key, JSON.stringify(dropletInfo));

  return dropletInfo;
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
