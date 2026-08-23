/** Zentrale Liste der Super-Admins (z. B. für das Audit-Log). */
export const SUPER_ADMIN_EMAILS = [
  "l.sandhoff@slt-rental.de",
  "b.noechel@slt-rental.de",
];

export const isSuperAdminEmail = (email?: string | null) =>
  SUPER_ADMIN_EMAILS.includes((email ?? "").toLowerCase());
