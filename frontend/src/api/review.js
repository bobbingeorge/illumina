import axios from 'axios';

const API_BASE = '/api';

export async function submitReview(code, language = 'python') {
  const response = await axios.post(`${API_BASE}/review`, {
    code,
    language,
  });
  return response.data;
}

export async function getSamples() {
  const response = await axios.get(`${API_BASE}/samples`);
  return response.data.samples;
}

export async function checkHealth() {
  const response = await axios.get(`${API_BASE}/health`);
  return response.data;
}
