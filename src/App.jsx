import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import { router } from './routes';

export default function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Login />;
  }

  return <RouterProvider router={router} />;
}