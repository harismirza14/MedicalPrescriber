import React from "react";
import { NavLink, useLocation, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import usePatient from "@/hooks/usePatient";
import { fetchPrescriber } from "@/api/prescriberApi";
import { useState, useEffect } from "react";
import Avatar from "@/components/atoms/Avatar/Avatar";
import { User, Pill, Users, UserCog, UsersRound } from "lucide-react"; 
import { shouldShowRightSidebar } from "@/utils/sidebarUtils";

export default function RightSidebar() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { prescriberId } = useParams();
  const { role } = useSelector((state) => state.auth);
  const patientId = searchParams.get("patientId");
  const currentTab = searchParams.get("tab"); 

  const visible = shouldShowRightSidebar(location.pathname, role);
  const isAdminDoctorView = role === "admin" && location.pathname.startsWith("/admin/doctor/");

  const { patient } = usePatient(visible && role === "doctor" ? patientId : null);

  const [doctorProfile, setDoctorProfile] = useState(null);
  useEffect(() => {
    if (isAdminDoctorView && prescriberId) {
      fetchPrescriber(prescriberId).then(setDoctorProfile).catch(() => setDoctorProfile(null));
    }
  }, [isAdminDoctorView, prescriberId]);

  if (!visible) return null;

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  // ─── Admin viewing a doctor ──────────────────────────────────────
  if (isAdminDoctorView) {
    return (
      <aside className="fixed right-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 overflow-y-auto z-20 p-4 transition-colors duration-200">
        <div className="flex items-center gap-3 mb-4">
          <Avatar name={doctorProfile?.name} size="md" color="blue" />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {doctorProfile?.name || "Loading..."}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {doctorProfile?.specialty || "Prescriber"}
            </p>
          </div>
        </div>

        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-2">Quick links</p>
        <div className="space-y-1">
          <NavLink
            to={`/admin/doctor/${prescriberId}?tab=profile`}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
              currentTab === "profile" || !currentTab
                ? "bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <UserCog className="w-4 h-4" /> Profile
          </NavLink>
          <NavLink
            to={`/admin/doctor/${prescriberId}?tab=patients`}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
              currentTab === "patients"
                ? "bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <UsersRound className="w-4 h-4" /> Patients
          </NavLink>
        </div>
      </aside>
    );
  }

  // ─── Doctor viewing a patient (existing) ──────────────────────
  return (
    <aside className="fixed right-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 overflow-y-auto z-20 p-4 transition-colors duration-200">
      <div className="flex items-center gap-3 mb-4">
        <Avatar name={patient?.name} size="md" />
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white truncate">
            {patient?.name || "Loading..."}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {calculateAge(patient?.dob)} yrs old
          </p>
        </div>
      </div>

      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase mb-2">Quick links</p>
      <div className="space-y-1">
        <NavLink
          to={`/patient-dashboard?patientId=${patientId}&tab=profile`}
          className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
            currentTab === "profile"
              ? "bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <User className="w-4 h-4" /> Profile
        </NavLink>

        <NavLink
          to={`/patient-dashboard?patientId=${patientId}&tab=medications`}
          className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
            currentTab === "medications"
              ? "bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Pill className="w-4 h-4" /> Medications
        </NavLink>

        <NavLink
          to={`/patient-dashboard?patientId=${patientId}&tab=careTeam`}
          className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
            currentTab === "careTeam"
              ? "bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Users className="w-4 h-4" /> Care Team
        </NavLink>
      </div>
    </aside>
  );
}