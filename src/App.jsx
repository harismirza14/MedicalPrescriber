import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import Medications from './pages/Medications'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/medications" replace />} />
        <Route path="medications" element={<Medications />} />
      </Route>
    </Routes>
  )
}