import React from 'react';
import { createBrowserRouter, Navigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import DashboardLayout from './components/templates/DashboardLayout/DashboardLayout';
import LoginPage from './pages/Login';
import Medications from './pages/Medications';
import PatientSelector from './pages/PatientSelector';
import AddPatient from './pages/AddPatient';

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
  const userId = user?.roleSpecificId;
  const [searchParams] = useSearchParams();
  const patientId = role === 'patient' ? user?.roleSpecificId : searchParams.get('patientId');

  return (
    <Medications
      role={role}
      userId={userId}
      patientId={patientId}
    />
  );
}

function PatientSelectorWrapper() {
  const { role, user } = useSelector((state) => state.auth);
  const doctorId = role === 'doctor' ? user?.roleSpecificId : null;
  return <PatientSelector doctorId={doctorId} />;
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
      {
        path: '/add-patient',
        element: <AddPatient />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);