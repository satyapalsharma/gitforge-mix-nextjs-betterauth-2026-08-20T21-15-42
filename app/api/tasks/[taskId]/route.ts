import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { AppError, BadRequestError, UnauthorizedError, NotFoundError, InternalServerError } from "@/lib/errors";
import type { Task, TaskStatus } from "@/types/task";

async function verifyWorkspaceMembership(userId: string, workspaceId: string): Promise<void> {
  const db = getDb();
  const member = db.prepare(`
    SELECT tm.user_id FROM team_members tm
    JOIN teams t ON tm.team_id = t.id
    WHERE t.workspace_id = ? AND tm.user_id = ?
    LIMIT 1
  `).get(workspaceId, userId) as { user_id: string } | undefined;

  if (!member) {
    throw new UnauthorizedError("You are not a member of this workspace");
  }
}

async function verifyAssigneeInWorkspace(assigneeId: string, workspaceId: string): Promise<void> {
  const db = getDb();
  const member = db.prepare(`
    SELECT tm.user_id FROM team_members tm
    JOIN teams t ON tm.team_id = t.id
    WHERE t.workspace_id = ? AND tm.user_id = ?
    LIMIT 1
  `).get(workspaceId, assigneeId) as { user_id: string } | undefined;

  if (!member) {
    throw new BadRequestError("Assignee is not a member of this workspace");
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      throw new UnauthorizedError("You must be logged in");
    }

    const db = getDb();
    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(params.taskId) as Task | undefined;

    if (!task) {
      throw new NotFoundError("Task not found");
    }

    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode || 500 });
    }
    console.error("GET task error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      throw new UnauthorizedError("You must be logged in");
    }

    const db = getDb();
    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(params.taskId) as Task | undefined;

    if (!task) {
      throw new NotFoundError("Task not found");
    }

    const project = db.prepare("SELECT workspace_id FROM projects WHERE id = ?").get(task.project_id) as { workspace_id: string } | undefined;
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    await verifyWorkspaceMembership(session.user.id, project.workspace_id);

    const body = await request.json();
    const { title, description, dueDate, assigneeId, status } = body;

    const updates: string[] = [];
    const values: any[] = [];

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0 || title.trim().length > 200) {
        throw new BadRequestError("Title must be a non-empty string with max 200 characters");
      }
      updates.push("title = ?");
      values.push(title.trim());
    }

    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description);
    }

    if (dueDate !== undefined) {
      if (typeof dueDate !== "string" || isNaN(Date.parse(dueDate))) {
        throw new BadRequestError("Due date must be a valid date string");
      }
      updates.push("due_date = ?");
      values.push(dueDate);
    }

    if (assigneeId !== undefined) {
      if (typeof assigneeId !== "string") {
        throw new BadRequestError("Assignee ID must be a string");
      }
      await verifyAssigneeInWorkspace(assigneeId, project.workspace_id);
      updates.push("assignee_id = ?");
      values.push(assigneeId);
    }

    if (status !== undefined) {
      const validStatuses: TaskStatus[] = ["todo", "in_progress", "done"];
      if (!validStatuses.includes(status)) {
        throw new BadRequestError("Status must be one of: todo, in_progress, done");
      }
      updates.push("status = ?");
      values.push(status);
    }

    if (updates.length === 0) {
      return NextResponse.json(task);
    }

    updates.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(params.taskId);

    const query = `UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`;
    db.prepare(query).run(...values);

    const updatedTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(params.taskId) as Task;

    return NextResponse.json(updatedTask);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode || 500 });
    }
    console.error("PATCH task error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      throw new UnauthorizedError("You must be logged in");
    }

    const db = getDb();
    const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(params.taskId) as Task | undefined;

    if (!task) {
      throw new NotFoundError("Task not found");
    }

    const project = db.prepare("SELECT workspace_id FROM projects WHERE id = ?").get(task.project_id) as { workspace_id: string } | undefined;
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    await verifyWorkspaceMembership(session.user.id, project.workspace_id);

    const body = await request.json();
    const { title, description, dueDate, assigneeId, status } = body;

    // Validate title if provided
    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length === 0 || title.trim().length > 200) {
        throw new BadRequestError("Title must be a non-empty string with max 200 characters");
      }
    }

    // Validate dueDate if provided
    if (dueDate !== undefined) {
      if (typeof dueDate !== "string" || isNaN(Date.parse(dueDate))) {
        throw new BadRequestError("Due date must be a valid date string");
      }
    }

    // Validate assigneeId if provided
    if (assigneeId !== undefined) {
      if (typeof assigneeId !== "string") {
        throw new BadRequestError("Assignee ID must be a string");
      }
      await verifyAssigneeInWorkspace(assigneeId, project.workspace_id);
    }

    // Validate status if provided
    if (status !== undefined) {
      const validStatuses: TaskStatus[] = ["todo", "in_progress", "done"];
      if (!validStatuses.includes(status)) {
        throw new BadRequestError("Status must be one of: todo, in_progress, done");
      }
    }

    // Build dynamic UPDATE query with only provided fields
    const updates: string[] = [];
    const values: any[] = [];

    if (title !== undefined) {
      updates.push("title = ?");
      values.push(title.trim());
    }
    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description);
    }
    if (dueDate !== undefined) {
      updates.push("due_date = ?");
      values.push(dueDate);
    }
    if (assigneeId !== undefined) {
      updates.push("assignee_id = ?");
      values.push(assigneeId);
    }
    if (status !== undefined) {
      updates.push("status = ?");
      values.push(status);
    }

    if (updates.length === 0) {
      return NextResponse.json(task);
    }

    updates.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(params.taskId);

    const query = `UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`;
    db.prepare(query).run(...values);

    const updatedTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(params.taskId) as Task;

    return NextResponse.json(updatedTask);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode || 500 });
    }
    console.error("PUT task error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
