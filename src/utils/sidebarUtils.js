export function shouldShowRightSidebar(pathname, role) {
  if (role === "doctor" && pathname === "/patient-dashboard") return true;
  if (role === "admin" && pathname.startsWith("/admin/doctor/")) return true;
  return false;
}