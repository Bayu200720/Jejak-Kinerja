export type AppRole = "asn" | "supervisor" | "admin";

// Placeholder only: replace with Supabase session + role lookup.
export function getPlaceholderRole(): AppRole {
  return "asn";
}
