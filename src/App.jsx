import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import DashboardLayout from './layouts/DashboardLayout';
import Medications from './pages/Medications';
import Login from './components/Login';
import PatientSelector from './pages/PatientSelector';

export default function App() {
  const { isAuthenticated, role, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && role === 'patient') {
      navigate('/medications', { replace: true });
    } else if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  if (!isAuthenticated) return <Login />;

  const userId = role === 'patient' ? user?.patient_id : user?.prescriber_id;
  const queryParams = new URLSearchParams(location.search);
  const patientIdFromQuery = queryParams.get('patientId');

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {role === 'patient' ? (
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/medications" replace />} />
            <Route
              path="medications"
              element={
                <Medications
                  role={role}
                  userId={userId}
                  patientId={user?.patient_id}
                />
              }
            />
          </Route>
        ) : (
          <>
            <Route path="/select-patient" element={<PatientSelector doctorId={userId} />} />
            <Route
              path="/medications"
              element={
                <DashboardLayout>
                  <Medications
                    role={role}
                    userId={userId}
                    patientId={patientIdFromQuery}
                  />
                </DashboardLayout>
              }
            />
            <Route path="/" element={<Navigate to="/select-patient" replace />} />
            <Route path="*" element={<Navigate to="/select-patient" replace />} />
          </>
        )}
      </Routes>
    </div>
  );
}