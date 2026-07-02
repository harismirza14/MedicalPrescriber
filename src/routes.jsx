import React from "react";
import {
  createBrowserRouter,
  Navigate,
  useSearchParams,
} from "react-router-dom";
import { useSelector } from "react-redux";
import DashboardLayout from "./components/templates/DashboardLayout/DashboardLayout";
import LoginPage from "./pages/Login";
import Medications from "./pages/Medications";
import PatientSelector from "./pages/PatientSelector";
import AdminDashboard from "./pages/AdminDashboard";
import CareTeam from "./pages/CareTeam";
import DoctorProfile from "./pages/DoctorProfile";
import DoctorSchedule from "./pages/DoctorSchedule";
import PatientDashboard from "./pages/PatientDashboard";
import PatientProfile from "./pages/PatientProfile";

function HomeRedirect() {
  const { role } = useSelector((state) => state.auth);
  if (role === "patient") {
    return <Navigate to="/medications" replace />;
  }
  if (role === "admin") {
    return <Navigate to="/admin" replace />;
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
  const patientId =
    role === "patient" ? user?.roleSpecificId : searchParams.get("patientId");

  return <Medications role={role} userId={userId} patientId={patientId} />;
}

function PatientSelectorWrapper() {
  const { role, user } = useSelector((state) => state.auth);
  const doctorId = role === "doctor" ? user?.roleSpecificId : null;
  return <PatientSelector doctorId={doctorId} />;
}

function PatientProfileWrapper() {
  const { role, user } = useSelector((state) => state.auth);
  const patientId = role === "patient" ? user?.roleSpecificId : null;
  return <PatientProfile patientId={patientId} />;
}

function PatientDashboardWrapper() {
  const { role, user } = useSelector((state) => state.auth);
  const userId = user?.roleSpecificId;
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId");

  if (role !== "doctor") {
    return <Navigate to="/" replace />;
  }

  return <PatientDashboard role={role} userId={userId} patientId={patientId} />;
}

function CareTeamWrapper() {
  const { role, user } = useSelector((state) => state.auth);
  const patientId = role === "patient" ? user?.roleSpecificId : null;
  return <CareTeam patientId={patientId} />;
}

function ProfileWrapper() {
  const { role, user } = useSelector((state) => state.auth);
  const prescriberId = role === "doctor" ? user?.roleSpecificId : null;
  return <DoctorProfile prescriberId={prescriberId} />;
}

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <HomeRedirect />,
    },
    {
      path: "/login",
      element: <LoginRouteWrapper />,
    },
    {
      element: <DashboardLayout />,
      children: [
        {
          path: "/medications",
          element: <MedicationsWrapper />,
        },
        {
          path: "/select-patient",
          element: <PatientSelectorWrapper />,
        },
        {
          path: "/patient-dashboard",
          element: <PatientDashboardWrapper />,
        },
        {
          path: "/admin",
          element: <AdminDashboard />,
        },
        {
          path: "/care-team",
          element: <CareTeamWrapper />,
        },
        {
          path: "/profile",
          element: <ProfileWrapper />,
        },
        {
          path: "/schedule",
          element: <DoctorSchedule />,
        },
        {
          path: "/my-profile",
          element: <PatientProfileWrapper />,
        },
      ],
    },
    {
      path: "*",
      element: <Navigate to="/" replace />,
    },
  ]
);