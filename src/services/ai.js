import api from './api.js';

export async function getCoach({ days = 90, freeOnly = true, provider } = {}) {
  const payload = { days, freeOnly };
  if (provider) payload.provider = provider;
  const { data } = await api.post('/api/ai/coach', payload);
  return data; // { coach, source, cached? }
}

export async function scanRecurring({ days = 180, freeOnly = true, provider } = {}) {
  const payload = { days, freeOnly };
  if (provider) payload.provider = provider;
  const { data } = await api.post('/api/ai/recurring/scan', payload);
  return data; // { items, source }
}
