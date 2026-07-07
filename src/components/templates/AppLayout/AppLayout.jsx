import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "../../layout/Header";
import LeftSidebar from "../../layout/LeftSidebar";
import RightSidebar from "../../layout/RightSidebar";
import { shouldShowRightSidebar } from "@/utils/sidebarUtils";

export default function AppLayout() {
  const location = useLocation();
  const { role } = useSelector((state) => state.auth);
  const showRightSidebar = shouldShowRightSidebar(location.pathname, role);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      <LeftSidebar />
      {showRightSidebar && <RightSidebar />}

      <main
        className={`pt-16 ml-64 min-h-screen transition-all duration-200 ${
          showRightSidebar ? "mr-64" : "mr-0"
        }`}
      >
        <div className="px-4 py-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}