import { NextResponse } from "next/server";
import { getDb } from "@/src/lib/db/index";
import { Task, CreateTaskInput } from "@/src/types/task";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const workspaceId = params.id;

    const url = new URL(request.url);
    const priority = url.searchParams.get("priority");

    const conditions: string[] = [
      `project_id IN (SELECT id FROM projects WHERE workspace_id = ?)`,
    ];
    const values: unknown[] = [workspaceId];

    if (priority) {
      conditions.push(`priority = ?`);
      values.push(priority);
    }

    const sql = `
      SELECT id, title, description, status, priority, project_id as projectId,
             assignee_id as assigneeId, reporter_id as reporterId,
             due_date as dueDate, tags, created_at as createdAt,
             updated_at as updatedAt
      FROM tasks
      WHERE ${conditions.join(" AND ")}
    `;

    const stmt = db.prepare(sql);
    const tasks = stmt.all(...values) as Task[];

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = (await request.json()) as CreateTaskInput;
    const db = getDb();
    const workspaceId = params.id;

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const stmt = db.prepare(
      `INSERT INTO tasks (id, title, description, status, priority, project_id,
                         assignee_id, reporter_id, due_date, tags,
                         created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    stmt.run(
      id,
      body.title,
      body.description ?? null,
      body.status ?? "todo",
      body.priority ?? "medium",
      body.projectId,
      body.assigneeId ?? null,
      body.reporterId,
      body.dueDate ? new Date(body.dueDate).toISOString() : null,
      JSON.stringify(body.tags ?? []),
      now,
      now
    );

    const created = db
      .prepare(
        `SELECT id, title, description, status, priority, project_id as projectId,
                assignee_id as assigneeId, reporter_id as reporterId,
                due_date as dueDate, tags, created_at as createdAt,
                updated_at as updatedAt
         FROM tasks WHERE id = ?`
      )
      .get(id) as Task;

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
