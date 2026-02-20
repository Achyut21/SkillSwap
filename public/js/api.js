function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function fetchPosts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/api/posts?${query}`, { headers: getHeaders() });
  return res.json();
}

export async function fetchPost(id) {
  const res = await fetch(`/api/posts/${id}`, { headers: getHeaders() });
  return res.json();
}

export async function createPost(data) {
  const res = await fetch('/api/posts', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updatePost(id, data) {
  const res = await fetch(`/api/posts/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deletePost(id) {
  const res = await fetch(`/api/posts/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return res.json();
}

export async function fetchInquiries(postId) {
  const res = await fetch(`/api/posts/${postId}/inquiries`, {
    headers: getHeaders(),
  });
  return res.json();
}

export async function createInquiry(postId, data) {
  const res = await fetch(`/api/posts/${postId}/inquiries`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteInquiry(id) {
  const res = await fetch(`/api/inquiries/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return res.json();
}

export async function signup(data) {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return { ok: res.ok, data: await res.json() };
}

export async function login(data) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return { ok: res.ok, data: await res.json() };
}

export async function getMe() {
  const res = await fetch('/api/auth/me', { headers: getHeaders() });
  if (!res.ok) return null;
  return res.json();
}
