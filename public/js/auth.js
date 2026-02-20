import { getMe } from './api.js';

let currentUser = null;

export function getUser() {
  return currentUser;
}

export function setUser(user) {
  currentUser = user;
}

export function getToken() {
  return localStorage.getItem('token');
}

export function saveAuth(token, user) {
  localStorage.setItem('token', token);
  currentUser = user;
}

export function logout() {
  localStorage.removeItem('token');
  currentUser = null;
}

export async function checkAuth() {
  const token = getToken();
  if (!token) return null;
  const result = await getMe();
  if (result && result.user) {
    currentUser = result.user;
    return currentUser;
  }
  logout();
  return null;
}
