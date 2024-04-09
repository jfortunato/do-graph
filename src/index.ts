import { handleFormSubmit, handlePageLoad } from './handlers';

// Get DOM elements
const $inputsForm = document.getElementById('inputs-form') as HTMLFormElement;
const $metric = document.getElementById('metric') as HTMLSelectElement;
const $timeframe = document.getElementById('timeframe') as HTMLSelectElement;
const $token = document.getElementById('token') as HTMLInputElement;
const $droplet = document.getElementById('droplet') as HTMLInputElement;
const $chartContainer = document.getElementById('chart-container') as HTMLDivElement;

// Set up event listeners
document.addEventListener('DOMContentLoaded', () => handlePageLoad($token, $droplet));
$inputsForm.addEventListener('submit', (event) => handleFormSubmit(event, $metric, $timeframe, $token, $droplet, $chartContainer));
