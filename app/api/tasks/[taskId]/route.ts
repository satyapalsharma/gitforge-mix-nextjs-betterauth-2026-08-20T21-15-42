import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth/config";
import { verifyWorkspaceMembership } from "@/lib/auth/workspace";
import type { UpdateTaskInput } from "@/types/task";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const db = getDb();
    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId) as any;

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Verify workspace membership
    await verifyWorkspaceMembership(session.user.id, task.workspaceId);

    return NextResponse.json(task);
  } catch (error) {
    console.error("GET /api/tasks/[taskId] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const db = getDb();
    const existingTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId) as any;

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Verify workspace membership
    await verifyWorkspaceMembership(session.user.id, existingTask.workspaceId);

    const body = await request.json();
    const { title, description, dueDate, assigneeId, status, priority } = body as UpdateTaskInput;

    if (!title || !status) {
      return NextResponse.json(
        { error: "Title and status are required" },
        { status: 400 }
      );
    }

    // If assignee is provided, verify they are in the workspace
    if (assigneeId) {
      await verifyAssigneeInWorkspace(assigneeId, existingTask.workspaceId);
    }

    const updatedTask = db
      .prepare(
        `UPDATE tasks SET title = ?, description = ?, dueDate = ?, assigneeId = ?, status = ?, priority = ?, updatedAt = ? WHERE id = ?`
      )
      .run(title, description || null, dueDate || null, assigneeId || null, status, priority ?? null, new Date().toISOString(), taskId);

    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId);

    return NextResponse.json(task);
  } catch (error) {
    console.error("PUT /api/tasks/[taskId] error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;
    const db = getDb();
    const existingTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId) as any;

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Verify workspace membership
    await verifyWorkspaceMembership(session.user.id, existingTask.workspaceId);

    db.prepare("DELETE FROM tasks WHERE id = ?").run(taskId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tasks/[taskId] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
