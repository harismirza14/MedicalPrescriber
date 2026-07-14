import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { logout } from "@/store/authSlice";
import {
  Users, Calendar, User, Pill, ArrowLeft, Shield, MoreVertical,
} from "lucide-react";
import usePatient from "@/hooks/usePatient";
import Avatar from "@/components/atoms/Avatar/Avatar";

export default function LeftSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, role } = useSelector((state) => state.auth);
  const patientId = searchParams.get("patientId");
  const isPatientDashboard = location.pathname.includes("/patient-dashboard");

  // State for three-dot menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Define constant nav items based on role – they do NOT change when viewing a patient
  let navItems = [];

  if (role === "patient") {
    navItems = [
      { label: "Medications", path: "/medications", icon: Pill },
      { label: "Care Team", path: "/care-team", icon: Users },
      { label: "Appointments", path: "/appointments", icon: Calendar },
    ];
  } else if (role === "admin") {
    navItems = [{ label: "Dashboard", path: "/admin", icon: Shield }];
  } else if (role === "doctor") {
    navItems = [
      { label: "Patients", path: "/select-patient", icon: Users },
      { label: "Schedule", path: "/schedule", icon: Calendar },
       { label: "Appointments", path: "/appointments", icon: Calendar },
    ];
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Profile path for the avatar click
  const getProfilePath = () => {
    if (role === "patient") return "/my-profile";
    if (role === "doctor") return "/profile";
    if (role === "admin") return "/admin";
    return "#";
  };

  // Always use the logged-in user's name (doctor, patient, or admin)
  const currentUserName = user?.name || "User";
  const currentUserRole = role || "Guest";

  return (
    <aside className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-y-auto z-20 transition-colors duration-200">
      {/* Navigation */}
      <nav className="flex-1 py-4 px-2">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.label}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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

      {/* Bottom: avatar + name (clickable to profile) + three-dot menu for logout */}
      <div className="mt-auto border-t border-gray-200 dark:border-gray-700 p-3 relative" ref={menuRef}>
        {isMenuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg overflow-hidden">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            >
              Logout
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Avatar + Name – always shows the logged‑in user */}
          <Link
            to={getProfilePath()}
            className="flex items-center gap-3 flex-1 min-w-0 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Avatar name={currentUserName} size="sm" />
            <div className="min-w-0 flex-1 text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {currentUserName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
                {currentUserRole}
              </p>
            </div>
          </Link>

          {/* Three-dot menu for logout */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="p-1 rounded-md text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
            aria-label="Menu"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}