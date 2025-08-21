import api from './api.js';

export async function listTransactions(params = {}) {
  // params: { page, size, from, to, category }
  const { data } = await api.get('/api/transactions', { params });
  return data; // { items, meta }
}

export async function createTransaction(payload) {
  // payload: { amount, category, date, note }
  const { data } = await api.post('/api/transactions', payload);
  return data?.item; // created item
}

export async function updateTransaction(id, payload) {
  const { data } = await api.put(`/api/transactions/${id}`, payload);
  return data?.item; // updated item
}

export async function deleteTransaction(id) {
  const { data } = await api.delete(`/api/transactions/${id}`);
  return data?.item ?? data; // deleted item or response
}
// still getting Error: Invalid request payload.