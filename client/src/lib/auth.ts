export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export function getStoredToken(): string | null {
  return localStorage.getItem("auth_token");
}

export function setStoredToken(token: string): void {
  localStorage.setItem("auth_token", token);
}

export function removeStoredToken(): void {
  localStorage.removeItem("auth_token");
}

export function getStoredUser(): User | null {
  const userJson = localStorage.getItem("auth_user");
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  localStorage.setItem("auth_user", JSON.stringify(user));
}

export function removeStoredUser(): void {
  localStorage.removeItem("auth_user");
}

export function clearAuth(): void {
  removeStoredToken();
  removeStoredUser();
}
