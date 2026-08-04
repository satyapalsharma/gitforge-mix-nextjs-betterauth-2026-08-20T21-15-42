import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { WorkspaceService } from "@/lib/services/workspace";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const workspace = db
    .prepare(
      `SELECT * FROM workspaces WHERE id = ? AND (owner_id = ? OR id IN (SELECT workspace_id FROM team_members WHERE user_id = ?))`
    )
    .get(params.id, session.user.id, session.user.id) as any;

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  return NextResponse.json(workspace);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const workspace = db
    .prepare("SELECT * FROM workspaces WHERE id = ? AND owner_id = ?")
    .get(params.id, session.user.id) as any;

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const body = await request.json();
  const updateStmt = db.prepare(
    `UPDATE workspaces SET name = ?, description = ?, updated_at = ? WHERE id = ?`
  );

  const updated = updateStmt.run(
    body.name ?? workspace.name,
    body.description ?? workspace.description,
    new Date().toISOString(),
    params.id
  );

  const updatedWorkspace = db
    .prepare("SELECT * FROM workspaces WHERE id = ?")
    .get(params.id) as any;

  return NextResponse.json(updatedWorkspace);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const workspace = db
    .prepare("SELECT * FROM workspaces WHERE id = ? AND owner_id = ?")
    .get(params.id, session.user.id) as any;

  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
  }

  const deleteStmt = db.prepare("DELETE FROM workspaces WHERE id = ?");
  deleteStmt.run(params.id);

  return NextResponse.json({ success: true });
}
