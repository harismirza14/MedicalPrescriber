export function shouldShowRightSidebar(pathname, role) {
  if ((role === "doctor" || role === "admin") && pathname === "/patient-dashboard") return true;
  if (role === "admin" && pathname.startsWith("/admin/doctor/")) return true;
  return false;
}