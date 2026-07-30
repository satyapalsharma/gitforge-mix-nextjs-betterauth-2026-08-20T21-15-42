import { NextResponse } from "next/server";
import { getDb } from "@/src/lib/db";
import { TASK_STATUSES } from "@/src/lib/constants";
import { auth } from "@/src/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taskId = params.taskId;
    const db = getDb();

    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId) as any;

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const member = db
      .prepare("SELECT 1 FROM workspace_members WHERE workspaceId = ? AND userId = ?")
      .get(task.workspaceId, session.user.id) as any;

    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body as { status: string };

    if (!status || !TASK_STATUSES.includes(status as any)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${TASK_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    db.prepare("UPDATE tasks SET status = ? WHERE id = ?").run(status, taskId);

    const updatedTask = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(taskId) as any;

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Failed to update task status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
