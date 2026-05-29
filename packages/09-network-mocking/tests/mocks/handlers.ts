import { http, HttpResponse } from "msw";
import type { User } from "../../src/userApi";

const DB: Record<number, User> = {
  1: { id: 1, name: "Alice" },
  2: { id: 2, name: "Bob" },
};

export const handlers = [
  http.get("https://api.example.com/users/:id", ({ params }) => {
    const id = Number(params.id);
    const u = DB[id];
    if (!u) return new HttpResponse("not found", { status: 404 });
    return HttpResponse.json(u);
  }),

  http.get("https://api.example.com/users", ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q");
    const list = Object.values(DB);
    if (!q) return HttpResponse.json(list);
    return HttpResponse.json(list.filter((u) => u.name.toLowerCase().includes(q.toLowerCase())));
  }),

  http.post("https://api.example.com/users", async ({ request }) => {
    const body = (await request.json()) as { name: string };
    const id = Math.max(0, ...Object.keys(DB).map(Number)) + 1;
    const u: User = { id, name: body.name };
    DB[id] = u;
    return HttpResponse.json(u, { status: 201 });
  }),
];
