import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(context: RouteContext) {
  try {
    const { session } = await requireAuth();
    const { id: workspaceId } = await context.params;
    const db = getDb();

    // Verify workspace exists
    const workspace = db.prepare("SELECT id FROM workspaces WHERE id = ?").get(workspaceId) as
      | { id: string }
      | undefined;

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // Verify user is a member of the workspace
    const membership = db
      .prepare("SELECT id FROM workspace_members WHERE workspace_id = ? AND user_id = ?")
      .get(workspaceId, session.user.id) as { id: string } | undefined;

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const members = db
      .prepare(
        `
        SELECT u.id, u.email, u.name, u.created_at, u.updated_at
        FROM users u
        INNER JOIN workspace_members wm ON u.id = wm.user_id
        WHERE wm.workspace_id = ?
        ORDER BY u.name ASC, u.email ASC
      `,
      )
      .all(workspaceId) as any[];

    const formattedMembers = members.map((member) => ({
      id: member.id,
      email: member.email,
      name: member.name,
      createdAt: member.created_at,
      updatedAt: member.updated_at,
    }));

    return NextResponse.json(formattedMembers);
  } catch (error) {
    console.error("Error fetching workspace members:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
