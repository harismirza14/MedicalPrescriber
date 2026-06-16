import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 pr-64 flex justify-center">
        {children || <Outlet />}
      </main>
      <Sidebar />
    </div>
  );
}
