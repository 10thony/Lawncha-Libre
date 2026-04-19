/** Session key for employee invite tokens (survives Clerk OAuth redirect, same origin). */
export const EMPLOYEE_INVITE_STORAGE_KEY = "buildcha_employee_invite_token";

export function readStoredEmployeeInviteToken(): string | null {
  try {
    return sessionStorage.getItem(EMPLOYEE_INVITE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeEmployeeInviteToken(token: string) {
  try {
    sessionStorage.setItem(EMPLOYEE_INVITE_STORAGE_KEY, token);
  } catch {
    /* ignore */
  }
}

export function clearStoredEmployeeInviteToken() {
  try {
    sessionStorage.removeItem(EMPLOYEE_INVITE_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function buildEmployeeInviteUrl(token: string): string {
  const base = `${window.location.origin}${window.location.pathname.replace(/\/?$/, "/")}`;
  const url = new URL(base);
  url.searchParams.set("invite", token);
  return url.toString();
}
