import { neon } from "@neondatabase/serverless";

type Env = {
  DATABASE_URL: string;
};

const getJsonBody = async (request: Request) => {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) return null;

  try {
    const body = (await request.json()) as unknown;
    return body;
  } catch {
    return null;
  }
};

const isValidEmail = (value: string) => {
  // Simple, pragmatic validation (not RFC-perfect)
  if (!value) return false;
  if (value.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const json = (data: unknown, init?: ResponseInit) => {
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), { ...init, headers });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const body = await getJsonBody(context.request);
  if (!body || typeof body !== "object") {
    return json({ error: "Invalid request." }, { status: 400 });
  }

  const emailRaw = (body as { email?: unknown }).email;
  const email = String(emailRaw ?? "").trim().toLowerCase();

  if (!isValidEmail(email)) {
    return json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const databaseUrl = context.env.DATABASE_URL;
  if (!databaseUrl) {
    return json({ error: "Server is not configured." }, { status: 500 });
  }

  const sql = neon(databaseUrl);

  try {
    await sql`
      insert into early_access_emails (email)
      values (${email})
      on conflict (email) do nothing
    `;

    return json({ ok: true }, { status: 200 });
  } catch {
    return json({ error: "Database error. Please try again." }, { status: 500 });
  }
};

