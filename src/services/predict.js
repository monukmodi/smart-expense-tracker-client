import api from './api.js';

export async function predictExpenses({ days = 30, useOpenAI = false, useGemini = false } = {}) {
  const { data } = await api.post('/api/predict', { days, useOpenAI, useGemini });
  return data; // { prediction, source }
}
