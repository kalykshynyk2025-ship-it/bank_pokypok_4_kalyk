'use client';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveUser(user: { id: string; name: string; email: string; language: string }) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as { id: string; name: string; email: string; language: string };
  } catch {
    return null;
  }
}
