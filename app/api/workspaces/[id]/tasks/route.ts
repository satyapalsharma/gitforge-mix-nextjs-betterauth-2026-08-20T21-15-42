import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import type { CreateTaskInput } from "@/types";

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

    const tasks = db
      .prepare(
        `
        SELECT t.*, u.name as assignee_name, u.email as assignee_email
        FROM tasks t
        LEFT JOIN users u ON t.assignee_id = u.id
        WHERE t.workspace_id = ?
        ORDER BY t.created_at DESC
      `,
      )
      .all(workspaceId) as any[];

    const formattedTasks = tasks.map((task) => ({
      id: task.id,
      workspaceId: task.workspace_id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.due_date,
      assigneeId: task.assignee_id,
      assigneeName: task.assignee_name,
      assigneeEmail: task.assignee_email,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    }));

    return NextResponse.json(formattedTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(context: RouteContext) {
  try {
    const { session } = await requireAuth();
    const { id: workspaceId } = await context.params;
    const body = (await context.request.json()) as CreateTaskInput;
    const db = getDb();

    // Validate required fields
    if (!body.title || body.title.trim() === "") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

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

    // Verify assignee is a member of the workspace (if provided)
    if (body.assigneeId) {
      const assigneeMembership = db
        .prepare("SELECT id FROM workspace_members WHERE workspace_id = ? AND user_id = ?")
        .get(workspaceId, body.assigneeId) as { id: string } | undefined;

      if (!assigneeMembership) {
        return NextResponse.json(
          { error: "Assignee is not a member of this workspace" },
          { status: 400 },
        );
      }
    }

    const taskId = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(
      `
      INSERT INTO tasks (id, workspace_id, title, description, status, priority, due_date, assignee_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      taskId,
      workspaceId,
      body.title.trim(),
      body.description?.trim() || null,
      "todo",
      "medium",
      body.dueDate || null,
      body.assigneeId || null,
      now,
      now,
    );

    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId) as any;

    const formattedTask = {
      id: task.id,
      workspaceId: task.workspace_id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.due_date,
      assigneeId: task.assignee_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    };

    return NextResponse.json(formattedTask, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
