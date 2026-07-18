import {
  getViewerContext,
  getWorkspaceSnapshot,
  publishWorkspace,
  saveWorkspaceDraft,
} from "@/lib/workspace";
import type { NextRequest } from "next/server";

export async function GET() {
  const viewer = await getViewerContext();
  const workspace = await getWorkspaceSnapshot(viewer);
  return Response.json({ ok: true, workspace });
}

export async function POST(request: NextRequest) {
  const viewer = await getViewerContext();
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        ok: false,
        message: "Invalid JSON payload.",
        fieldErrors: {},
      },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object") {
    return Response.json(
      {
        ok: false,
        message: "Invalid workspace payload.",
        fieldErrors: {},
      },
      { status: 400 },
    );
  }

  const action = (body as { action?: unknown }).action;
  const workspace = (body as { workspace?: unknown }).workspace;

  if (action !== "save" && action !== "publish") {
    return Response.json(
      {
        ok: false,
        message: "Unknown workspace action.",
        fieldErrors: {},
      },
      { status: 400 },
    );
  }

  const result =
    action === "publish"
      ? await publishWorkspace(viewer, workspace)
      : await saveWorkspaceDraft(viewer, workspace);

  if (!result.ok) {
    const status = result.message.toLowerCase().includes("sign in") ? 401 : 400;
    return Response.json(result, { status });
  }

  return Response.json(result);
}
