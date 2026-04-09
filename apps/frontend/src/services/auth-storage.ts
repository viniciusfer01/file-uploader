import { AuthUser } from '../types/auth';

const tokenKey = 'file-uploader.auth.token';
const userKey = 'file-uploader.auth.user';

export function getStoredToken() {
  return window.localStorage.getItem(tokenKey);
}

export function getStoredUser() {
  const rawUser = window.localStorage.getItem(userKey);

  if (!rawUser) {
    return null;
  }

  return JSON.parse(rawUser) as AuthUser;
}

export function persistSession(token: string, user: AuthUser) {
  window.localStorage.setItem(tokenKey, token);
  window.localStorage.setItem(userKey, JSON.stringify(user));
}

export function clearSession() {
  window.localStorage.removeItem(tokenKey);
  window.localStorage.removeItem(userKey);
}

