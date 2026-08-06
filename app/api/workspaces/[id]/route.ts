import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { UpdateWorkspaceInput } from "@/types/workspace";

interface RouteParams {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    const workspace = db
      .prepare("SELECT id, name, description, ownerId, createdAt, updatedAt FROM workspaces WHERE id = ?")
      .get(id) as any;

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    return NextResponse.json(workspace);
  } catch (error) {
    console.error("Failed to fetch workspace:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    const workspace = db
      .prepare("SELECT ownerId FROM workspaces WHERE id = ?")
      .get(id) as { ownerId: string } | undefined;

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    if (workspace.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as UpdateWorkspaceInput;

    const updates: string[] = [];
    const values: any[] = [];

    if (body.name !== undefined) {
      const trimmedName = body.name.trim();
      if (trimmedName.length === 0) {
        return NextResponse.json(
          { error: "Name cannot be empty" },
          { status: 400 }
        );
      }
      if (trimmedName.length > 100) {
        return NextResponse.json(
          { error: "Name must be 100 characters or less" },
          { status: 400 }
        );
      }
      updates.push("name = ?");
      values.push(trimmedName);
    }

    if (body.description !== undefined) {
      const trimmedDescription = body.description.trim();
      if (trimmedDescription.length > 500) {
        return NextResponse.json(
          { error: "Description must be 500 characters or less" },
          { status: 400 }
        );
      }
      updates.push("description = ?");
      values.push(trimmedDescription);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    values.push(id);
    const query = `UPDATE workspaces SET ${updates.join(", ")} WHERE id = ?`;
    db.prepare(query).run(...values);

    const updatedWorkspace = db
      .prepare("SELECT id, name, description, ownerId, createdAt, updatedAt FROM workspaces WHERE id = ?")
      .get(id) as any;

    return NextResponse.json(updatedWorkspace);
  } catch (error) {
    console.error("Failed to update workspace:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
