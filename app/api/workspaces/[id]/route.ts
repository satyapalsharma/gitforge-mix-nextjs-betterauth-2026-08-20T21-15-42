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

    const workspace = db.prepare("SELECT * FROM workspaces WHERE id = ?").get(workspaceId) as any;

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // Verify user is a member
    const membership = db
      .prepare("SELECT id FROM workspace_members WHERE workspace_id = ? AND user_id = ?")
      .get(workspaceId, session.user.id) as { id: string } | undefined;

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formattedWorkspace = {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      description: workspace.description,
      ownerId: workspace.owner_id,
      createdAt: workspace.created_at,
      updatedAt: workspace.updated_at,
    };

    return NextResponse.json(formattedWorkspace);
  } catch (error) {
    console.error("Error fetching workspace:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
