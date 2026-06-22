import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../store/authSlice";

const navItems = [{ label: "Medications", path: "/medications" }];

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, role } = useSelector((state) => state.auth);

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

  const handleSwitchPatient = () => {
    navigate("/select-patient");
  };

  return (
    <aside className="w-64 h-screen bg-white border-l border-gray-200 flex flex-col fixed right-0 top-0 overflow-y-auto">
      <div className="p-4 border-b border-gray-100">
        {role === "patient" && (
          <>
            <div className="mb-3">
              <p className="font-bold text-lg text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500 mt-0.5">
                {user.roleSpecificId} -{" "}
                {user.dob ? new Date(user.dob).getFullYear() : "N/A"}
              </p>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Next appointment
                </p>
                <p className="text-sm text-gray-600">
                  {formatDate(user.next_appointment)}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Visit Frequency
                </p>
                <p className="text-sm text-gray-600">
                  {user.visit_frequency || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Insurance</p>
                <p className="text-sm text-gray-600">
                  {user.insurance || "N/A"}
                </p>
              </div>
            </div>
          </>
        )}
        {role === "doctor" && (
          <>
            <div className="mb-3">
              <p className="font-bold text-lg text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500 mt-0.5">
                {user.roleSpecificId} • Prescriber
              </p>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Role: {user.role || "Doctor"}</p>
            </div>
          </>
        )}
      </div>

      <nav className="flex-1 py-3 px-2">
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {role === "doctor" && (
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleSwitchPatient}
            className="w-full py-2 px-3 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            Switch Patient
          </button>
        </div>
      )}

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full py-2 px-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
