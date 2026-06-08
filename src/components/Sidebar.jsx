import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { fetchPatient } from '../services/api'; 

const navItems = [
  { label: 'Medications', path: '/medications' },
];

export default function Sidebar({ patientId = '1' }) { 
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!patientId) return;
    setLoading(true);
    fetchPatient(patientId)
      .then(data => {
        setPatient(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load patient:', err);
        setError('Could not load patient data.');
        setLoading(false);
      });
  }, [patientId]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not Scheduled';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <aside className="w-64 h-screen bg-white border-l border-gray-200 flex flex-col fixed right-0 top-0 overflow-y-auto p-4">
        <p className="text-sm text-gray-500">Loading patient info...</p>
      </aside>
    );
  }

  if (error || !patient) {
    return (
      <aside className="w-64 h-screen bg-white border-l border-gray-200 flex flex-col fixed right-0 top-0 overflow-y-auto p-4">
        <p className="text-sm text-red-600">Error loading patient data.</p>
      </aside>
    );
  }

  return (
    <aside className="w-64 h-screen bg-white border-l border-gray-200 flex flex-col fixed right-0 top-0 overflow-y-auto">
      {/* Patient Info */}
      <div className="p-4 border-b border-gray-100">
        <div className="mb-3">
          <p className="font-bold text-lg text-gray-900 leading-tight">{patient.name}</p>
          <p className="text-sm text-gray-500 mt-0.5">
            {patient.patient_id} - {patient.dob ? new Date(patient.dob).getFullYear() : 'N/A'}
          </p>
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-sm font-semibold text-gray-800">Next appointment</p>
            <p className="text-sm text-gray-600">{formatDate(patient.next_appointment)}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Visit Frequency</p>
            <p className="text-sm text-gray-600">{patient.visit_frequency || 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Insurance</p>
            <p className="text-sm text-gray-600">{patient.insurance || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2">
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm transition-colors duration-100 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}