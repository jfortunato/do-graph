import { getData, getDropletInfo, Metric } from './api';
import { displayChart } from './graph';

// Populate token & droplet ID if they exist in the url query string
export function handlePageLoad($token: HTMLInputElement, $droplet: HTMLInputElement): void {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const dropletId = urlParams.get('droplet');

  if (token) {
    $token.value = token;
  }

  if (dropletId) {
    $droplet.value = dropletId;
  }
}

export async function handleFormSubmit(event: SubmitEvent, $metric: HTMLSelectElement, $timeframe: HTMLSelectElement, $token: HTMLInputElement, $droplet: HTMLInputElement, $chartContainer: HTMLDivElement): Promise<void> {
  event.preventDefault();
  const metric = $metric.value as Metric;
  const timeframe = parseInt($timeframe.value);
  const token = $token.value;
  const dropletId = $droplet.value;

  let data, dropletInfo;
  try {
    dropletInfo = await getDropletInfo(token, dropletId);
    data = await getData(token, metric, dropletId, timeframe);
  } catch (error) {
    alert("Could not fetch data from DigitalOcean API");

    return;
  }

  displayChart($chartContainer, data, dropletInfo, timeframe);
}
