import { createClient } from "@/lib/supabase/server";

export type UserRole = "asn" | "supervisor" | "admin";

export type UserProfile = {
  id: string;
  full_name: string;
  nip?: string;
  organization_id: string;
  roles: UserRole[];
  primaryRole: UserRole;
};

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, full_name, nip, organization_id, role")
    .eq("auth_user_id", user.id)
    .single();

  if (error || !profile) {
    return null;
  }

  // ambil roles dari profile_roles
  const { data: rolesData } = await supabase
    .from("profile_roles")
    .select("role")
    .eq("profile_id", profile.id);

  const roles: UserRole[] = ((rolesData || []) as { role: string }[])
    .map((r) => r.role as UserRole);

  // pastikan roles memiliki minimal satu nilai
  const defaultRole: UserRole = roles.includes("admin") ? "admin" : roles.includes("supervisor") ? "supervisor" : "asn";

  return {
    ...profile,
    roles,
    primaryRole: roles.length > 0 ? defaultRole : "asn",
  };
}

export async function requireAuth(): Promise<UserProfile> {
  const profile = await getCurrentUserProfile();
  if (!profile) {
    throw new Error("Unauthorized");
  }
  return profile;
}