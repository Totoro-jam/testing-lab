export interface User {
  id: number;
  name: string;
}

const BASE = "https://api.example.com";

export async function fetchUser(id: number): Promise<User> {
  const res = await fetch(`${BASE}/users/${id}`);
  if (!res.ok) {
    throw new Error(`fetchUser failed: ${res.status}`);
  }
  return res.json() as Promise<User>;
}

export async function createUser(name: string): Promise<User> {
  const res = await fetch(`${BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    throw new Error(`createUser failed: ${res.status}`);
  }
  return res.json() as Promise<User>;
}

export async function listUsers(query?: { q?: string }): Promise<User[]> {
  const url = new URL(`${BASE}/users`);
  if (query?.q) url.searchParams.set("q", query.q);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`listUsers failed: ${res.status}`);
  return res.json() as Promise<User[]>;
}
