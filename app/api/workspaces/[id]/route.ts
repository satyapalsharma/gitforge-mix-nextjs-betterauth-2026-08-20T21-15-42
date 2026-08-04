import { NextResponse } from "next/server";
import { getDb } from "@/src/lib/db";
import { auth } from "@/src/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const workspace = db
      .prepare("SELECT * FROM workspaces WHERE id = ?")
      .get(params.id) as any;

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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const workspace = db
      .prepare("SELECT * FROM workspaces WHERE id = ?")
      .get(params.id) as any;

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    if (workspace.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description } = body;

    const updateStmt = db.prepare(
      "UPDATE workspaces SET name = ?, description = ?, updatedAt = ? WHERE id = ?"
    );

    updateStmt.run(
      name ?? workspace.name,
      description ?? workspace.description,
      new Date().toISOString(),
      params.id
    );

    const updatedWorkspace = db
      .prepare("SELECT * FROM workspaces WHERE id = ?")
      .get(params.id) as any;

    return NextResponse.json(updatedWorkspace);
  } catch (error) {
    console.error("Failed to update workspace:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const workspace = db
      .prepare("SELECT * FROM workspaces WHERE id = ?")
      .get(params.id) as any;

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    if (workspace.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Ensure tasks table exists
    const createTasksTable = `
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        workspaceId TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        dueDate TEXT,
        status TEXT DEFAULT 'todo',
        assigneeId TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `;
    db.exec(createTasksTable);

    // Use transaction for cascade delete
    const transaction = db.transaction(() => {
      db.prepare("DELETE FROM tasks WHERE workspaceId = ?").run(params.id);
      db.prepare("DELETE FROM workspace_members WHERE workspaceId = ?").run(params.id);
      db.prepare("DELETE FROM workspaces WHERE id = ?").run(params.id);
    });

    transaction();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete workspace:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
