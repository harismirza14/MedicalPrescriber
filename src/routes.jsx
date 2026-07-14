import React from "react";
import {
  createBrowserRouter,
  Navigate,
  useSearchParams,
  useParams,
} from "react-router-dom";
import { useSelector } from "react-redux";
import DoctorDetail from "./pages/DoctorDetail";
import AppLayout from "./components/templates/AppLayout/AppLayout";
import LoginPage from "./pages/Login";
import Medications from "./pages/Medications";
import PatientSelector from "./pages/PatientSelector";
import AdminDashboard from "./pages/AdminDashboard";
import CareTeam from "./pages/CareTeam";
import DoctorProfile from "./pages/DoctorProfile";
import DoctorSchedule from "./pages/DoctorSchedule";
import PatientDashboard from "./pages/PatientDashboard";
import PatientProfile from "./pages/PatientProfile";
import Appointments from "./pages/Appointments";

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

function ScheduleWrapper() {
  const { user } = useSelector((state) => state.auth);
  return <DoctorSchedule prescriberId={user?.roleSpecificId} />;
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

// ✅ FIXED: Allow admin to view patient dashboard
function PatientDashboardWrapper() {
  const { role, user } = useSelector((state) => state.auth);
  const userId = user?.roleSpecificId;
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId");

  // Allow both doctor and admin
  if (role !== "doctor" && role !== "admin") {
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

function PatientProfileWrapper() {
  const { role, user } = useSelector((state) => state.auth);
  const patientId = role === "patient" ? user?.roleSpecificId : null;
  return <PatientProfile patientId={patientId} />;
}

function DoctorDetailWrapper() {
  const { prescriberId } = useParams();
  return <DoctorDetail prescriberId={prescriberId} />;
}

function AppointmentsWrapper() {
  const { role, user } = useSelector((state) => state.auth);
  return <Appointments role={role} id={user?.roleSpecificId} />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeRedirect />,
  },
  {
    path: "/login",
    element: <LoginRouteWrapper />,
  },
  {
    element: <AppLayout />,
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
        path: "/admin/doctor/:prescriberId",
        element: <DoctorDetailWrapper />,
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
        element: <ScheduleWrapper />,
      },
      {
        path: "/my-profile",
        element: <PatientProfileWrapper />,
      },
      {
        path: "/appointments",
        element: <AppointmentsWrapper />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);