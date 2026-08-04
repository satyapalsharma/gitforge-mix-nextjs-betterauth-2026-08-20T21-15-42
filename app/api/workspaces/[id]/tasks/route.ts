import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getDb } from "@/src/lib/db";
import { auth } from "@/src/lib/auth";

function mapTaskRow(row: any): any {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    projectId: row.project_id,
    assigneeId: row.assignee_id,
    reporterId: row.reporter_id,
    dueDate: row.due_date,
    tags: JSON.parse(row.tags || "[]"),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = params.id;
    const db = getDb();

    const member = db
      .prepare("SELECT 1 FROM workspace_members WHERE workspaceId = ? AND userId = ?")
      .get(workspaceId, session.user.id) as any;

    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rows = db
      .prepare(
        `SELECT t.* FROM tasks t
         INNER JOIN projects p ON t.project_id = p.id
         WHERE p.workspace_id = ?
         ORDER BY t.created_at DESC`
      )
      .all(workspaceId) as any[];

    const tasks = rows.map(mapTaskRow);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Failed to fetch workspace tasks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
