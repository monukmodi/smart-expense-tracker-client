import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getToken } from '../utils/storage.js';

export default function RequireAuth({ children }) {
  const location = useLocation();
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
