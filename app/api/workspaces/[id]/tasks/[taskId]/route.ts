import { NextResponse } from "next/server";
import { getDb } from "@/src/lib/db/index";
import { UpdateTaskInput, Task } from "@/src/types/task";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const body = (await request.json()) as UpdateTaskInput;
    const db = getDb();
    const taskId = params.taskId;

    const existing = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(taskId) as { id: string } | undefined;

    if (!existing) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const updates: string[] = [];
    const values: unknown[] = [];

    if (body.title !== undefined) {
      updates.push("title = ?");
      values.push(body.title);
    }
    if (body.description !== undefined) {
      updates.push("description = ?");
      values.push(body.description);
    }
    if (body.status !== undefined) {
      updates.push("status = ?");
      values.push(body.status);
    }
    if (body.priority !== undefined) {
      updates.push("priority = ?");
      values.push(body.priority);
    }
    if (body.assigneeId !== undefined) {
      updates.push("assignee_id = ?");
      values.push(body.assigneeId ?? null);
    }
    if (body.dueDate !== undefined) {
      updates.push("due_date = ?");
      values.push(body.dueDate ? new Date(body.dueDate).toISOString() : null);
    }
    if (body.tags !== undefined) {
      updates.push("tags = ?");
      values.push(JSON.stringify(body.tags));
    }

    if (updates.length === 0) {
      const task = db
        .prepare(
          `SELECT id, title, description, status, priority, project_id as projectId,
                  assignee_id as assigneeId, reporter_id as reporterId,
                  due_date as dueDate, tags, created_at as createdAt,
                  updated_at as updatedAt
           FROM tasks WHERE id = ?`
        )
        .get(taskId) as Task;
      return NextResponse.json(task);
    }

    updates.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(taskId);

    const sql = `UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`;
    db.prepare(sql).run(...values);

    const updated = db
      .prepare(
        `SELECT id, title, description, status, priority, project_id as projectId,
                assignee_id as assigneeId, reporter_id as reporterId,
                due_date as dueDate, tags, created_at as createdAt,
                updated_at as updatedAt
         FROM tasks WHERE id = ?`
      )
      .get(taskId) as Task;

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
