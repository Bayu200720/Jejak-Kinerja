export function getDashboardPathForRole(role: "asn" | "supervisor" | "admin"): string {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "supervisor":
      return "/dashboard/supervisor";
    case "asn":
    default:
      return "/dashboard/asn";
  }
}

export function isRouteAllowedForRole(pathname: string, role: "asn" | "supervisor" | "admin"): boolean {
  if (pathname.startsWith("/dashboard/admin") && role !== "admin") return false;
  if (pathname.startsWith("/dashboard/supervisor") && role !== "supervisor" && role !== "admin") return false; // admin bisa akses supervisor?
  // asn hanya ke asn routes, tapi bisa juga ke dashboard umum
  if (pathname.startsWith("/dashboard/asn") && role === "supervisor") return false;
  return true;
}
