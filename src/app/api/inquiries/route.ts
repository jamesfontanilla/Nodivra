import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { deleteInquiry, getOwnerInquiries, submitPublicInquiry, updateInquiry } from "@/lib/inbox";
import { getViewerContext } from "@/lib/workspace";

const INQUIRY_TOKEN_COOKIE = "nodivra_inquiry_token";
const MAX_INQUIRY_PAYLOAD_BYTES = 16_000;

async function readJson(request: Request) {
  try {
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_INQUIRY_PAYLOAD_BYTES) {
      return null;
    }
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function mutationStatus(message: string) {
  return message.toLowerCase().includes("sign in") ? 401 : 400;
}

export async function GET() {
  const viewer = await getViewerContext();
  if (viewer.mode === "anonymous") {
    return Response.json({ ok: false, message: "Sign in to view your inbox.", inquiries: [] }, { status: 401 });
  }

  return Response.json({ ok: true, inquiries: await getOwnerInquiries(viewer) });
}

export async function POST(request: Request) {
  const body = await readJson(request);
  const cookieStore = await cookies();
  const token = cookieStore.get(INQUIRY_TOKEN_COOKIE)?.value ?? randomUUID();

  if (!cookieStore.get(INQUIRY_TOKEN_COOKIE)) {
    cookieStore.set({
      name: INQUIRY_TOKEN_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }

  const result = await submitPublicInquiry(body, token);
  return Response.json(result, { status: result.ok ? 200 : 400 });
}

export async function PATCH(request: Request) {
  const viewer = await getViewerContext();
  const result = await updateInquiry(viewer, await readJson(request));
  return Response.json(result, { status: result.ok ? 200 : mutationStatus(result.message) });
}

export async function DELETE(request: Request) {
  const viewer = await getViewerContext();
  const body = await readJson(request);
  const id = body && typeof body === "object" && "id" in body && typeof body.id === "string" ? body.id : "";
  const result = await deleteInquiry(viewer, id);
  return Response.json(result, { status: result.ok ? 200 : mutationStatus(result.message) });
}
