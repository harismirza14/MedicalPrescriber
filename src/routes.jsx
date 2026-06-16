import React from 'react';
import { createBrowserRouter, Navigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/LoginPage';
import MedicationsPage from './pages/MedicationsPage';
import PatientSelectorPage from './pages/PatientSelectorPage';

function HomeRedirect() {
  const { role } = useSelector((state) => state.auth);
  if (role === 'patient') {
    return <Navigate to="/medications" replace />;
  }
  return <Navigate to="/select-patient" replace />;
}

function LoginRouteWrapper() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <LoginPage />;
}

function MedicationsWrapper() {
  const { role, user } = useSelector((state) => state.auth);
  const userId = role === 'patient' ? user?.patient_id : user?.prescriber_id;
  const [searchParams] = useSearchParams();
  const patientId = role === 'patient' ? user?.patient_id : searchParams.get('patientId');

  return (
    <MedicationsPage
      role={role}
      userId={userId}
      patientId={patientId}
    />
  );
}

function PatientSelectorWrapper() {
  const { role, user } = useSelector((state) => state.auth);
  const userId = role === 'patient' ? user?.patient_id : user?.prescriber_id;

  return <PatientSelectorPage doctorId={userId} />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeRedirect />,
  },
  {
    path: '/login',
    element: <LoginRouteWrapper />,
  },
  {
    element: <DashboardLayout />,
    children: [
      {
        path: '/medications',
        element: <MedicationsWrapper />,
      },
      {
        path: '/select-patient',
        element: <PatientSelectorWrapper />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
