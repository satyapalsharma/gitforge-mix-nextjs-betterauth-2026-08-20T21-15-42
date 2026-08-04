import { NextResponse } from "next/server";
import { getDb } from "@/src/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const workspaceId = params.id;

    const workspace = db
      .prepare(
        `SELECT id, name, slug, description, owner_id, created_at, updated_at
         FROM workspaces
         WHERE id = ?`
      )
      .get(workspaceId) as
      | {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        owner_id: string;
        created_at: string;
        updated_at: string;
      }
      | undefined;

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description ?? undefined,
        ownerId: workspace.owner_id,
        createdAt: workspace.created_at,
        updatedAt: workspace.updated_at,
      },
    });
  } catch (error) {
    console.error("Failed to fetch workspace:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspace" },
      { status: 500 }
    );
  }
}
