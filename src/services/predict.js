import api from './api.js';

export async function predictExpenses({ days = 30, useOpenAI = false } = {}) {
  const { data } = await api.post('/api/predict', { days, useOpenAI });
  return data; // { prediction, details }
}
