import React from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Bell, Sun, Moon, ArrowLeft, Pill } from "lucide-react";
import { useTheme } from "@/context/Theme";

const pageConfig = {
  '/select-patient': { title: 'Select a Patient', showBack: false },
  '/patient-dashboard': { title: 'Patient Dashboard', showBack: true, backTo: '/select-patient' },
  '/medications': { title: 'Medications', showBack: false },
  '/admin': { title: 'Admin Dashboard', showBack: false },
  '/profile': { title: 'My Profile', showBack: true, backTo: '/select-patient' },
  '/schedule': { title: 'Schedule', showBack: true, backTo: '/select-patient' },
  '/care-team': { title: 'Care Team', showBack: true, backTo: '/medications' },
  '/my-profile': { title: 'My Profile', showBack: true, backTo: '/medications' },
};

const TAB_TITLES = {
  profile: 'Patient Profile',
  medications: 'Medications',
  careTeam: 'Care Team',
};

export default function Header() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { theme, toggleTheme } = useTheme();

  // /admin/doctor/:prescriberId isn't a fixed path, so it can't live in pageConfig's
  // exact-match lookup — handle it explicitly before falling back to the static map.
  const config = location.pathname.startsWith('/admin/doctor/')
    ? { title: 'Doctor Profile', showBack: true, backTo: '/admin' }
    : pageConfig[location.pathname] || { title: '', showBack: false };

  let title = config.title;
  if (location.pathname === '/patient-dashboard') {
    const tab = searchParams.get('tab') || 'profile';
    title = TAB_TITLES[tab] || config.title;
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between transition-colors duration-200">
      <div className="flex items-center min-w-0 flex-1">
        <div className="w-64 flex items-center gap-2 flex-shrink-0 pr-4">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Pill className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900 dark:text-white">MediCare</span>
        </div>

        <div className="flex items-center gap-3 min-w-0">
          {config.showBack && (
            <Link
              to={config.backTo}
              className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex-shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}

          <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          className="relative p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}