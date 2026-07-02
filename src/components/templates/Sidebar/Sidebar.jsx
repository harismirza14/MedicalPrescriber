import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { logout } from "@/store/authSlice";
import {
  Users,
  UserCog,
  Calendar,
  User,
  Pill,
  ArrowLeft,
  Shield,
  Sun,
  Moon,
} from "lucide-react";
import usePatient from "@/hooks/usePatient";
import Avatar from "@/components/atoms/Avatar/Avatar";
import { useTheme } from "@/context/Theme";

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, role } = useSelector((state) => state.auth);
  const patientId = searchParams.get("patientId");
  const currentTab = searchParams.get("tab") || "profile";
  const isPatientDashboard = location.pathname.includes("/patient-dashboard");
  const { theme, toggleTheme } = useTheme();
  const { patient } = usePatient(
    isPatientDashboard && role === "doctor" ? patientId : null,
  );

  let navItems = [];

  if (role === "patient") {
    navItems = [
      { label: "My Profile", path: "/my-profile", icon: User },
      { label: "Medications", path: "/medications", icon: Pill },
      { label: "Care Team", path: "/care-team", icon: Users },
    ];
  } else if (role === "admin") {
    navItems = [{ label: "Dashboard", path: "/admin", icon: Shield }];
  } else if (role === "doctor") {
    if (isPatientDashboard && patientId) {
      navItems = [
        {
          label: "Patient Profile",
          path: `/patient-dashboard?patientId=${patientId}&tab=profile`,
          icon: User,
          tabKey: "profile",
        },
        {
          label: "Medications",
          path: `/patient-dashboard?patientId=${patientId}&tab=medications`,
          icon: Pill,
          tabKey: "medications",
        },
        {
          label: "Care Team",
          path: `/patient-dashboard?patientId=${patientId}&tab=careTeam`,
          icon: Users,
          tabKey: "careTeam",
        },
        {
          label: "Back to Patients",
          path: "/select-patient",
          icon: ArrowLeft,
        },
      ];
    } else {
      // General doctor views (Patient selector, Profile, Schedule)
      navItems = [
        { label: "Patients", path: "/select-patient", icon: Users },
        { label: "My Profile", path: "/profile", icon: UserCog },
        { label: "Schedule", path: "/schedule", icon: Calendar },
      ];
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not Scheduled";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <aside className="w-64 h-screen bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col fixed right-0 top-0 overflow-y-auto z-10">
      {/* Header – user info */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {/* Patient Info Header */}
        {role === "patient" && (
          <div className="flex items-center gap-3 mb-3">
            <Avatar name={user?.name} size="md" />
            <div className="min-w-0">
              <p className="font-bold text-gray-900 dark:text-white truncate">
                {user?.name}
              </p>
            </div>
          </div>
        )}

        {/* Doctor Contextual Header */}
        {role === "doctor" && (
          <>
            {isPatientDashboard && patientId ? (
              <div className="flex items-center gap-3">
                <Avatar name={patient?.name} size="md" color="blue" />
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white truncate">
                    {patient?.name || "Loading..."}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Viewing patient
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={user?.name} size="md" />
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white truncate">
                    {user?.name}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Admin Info Header */}
        {role === "admin" && (
          <div className="flex items-center gap-3">
            <Avatar name={user?.name || "Admin"} size="md" color="gray" />
            <div className="min-w-0">
              <p className="font-bold text-gray-900 dark:text-white truncate">
                {user?.name || "Admin"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                System Administrator
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.tabKey
              ? currentTab === item.tabKey
              : location.pathname === item.path;

            const isBackBtn = item.label === "Back to Patients";

            return (
              <li
                key={item.label}
                className={
                  isBackBtn
                    ? "mb-4 border-b border-gray-200 dark:border-gray-700 pb-2"
                    : ""
                }
              >
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
        >
          {theme === "light" ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </button>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full py-2 px-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}