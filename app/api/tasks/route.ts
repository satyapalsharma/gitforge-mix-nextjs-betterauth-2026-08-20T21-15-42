import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { Task } from "@/types/task";

const ALLOWED_SORT_BY = new Set(["dueDate", "createdAt", "priority"]);
const ALLOWED_SORT_ORDER = new Set(["asc", "desc"]);

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const userId = session.user.id;

    // Get all workspace IDs the user belongs to
    const userWorkspaces = db
      .prepare(
        `SELECT workspaceId FROM workspace_members WHERE userId = ?`
      )
      .all(userId) as Array<{ workspaceId: string }>;

    if (userWorkspaces.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const workspaceIds = userWorkspaces.map((w) => w.workspaceId);

    // Parse query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get("status")?.trim();
    const assigneeId = url.searchParams.get("assigneeId")?.trim();
    const dueFrom = url.searchParams.get("dueFrom")?.trim();
    const dueTo = url.searchParams.get("dueTo")?.trim();
    const sortBy = url.searchParams.get("sortBy")?.trim();
    const sortOrder = url.searchParams.get("sortOrder")?.trim().toLowerCase();

    // Build dynamic WHERE clause and params
    const conditions: string[] = [`workspaceId IN (${workspaceIds.map(() => "?").join(", ")})`];
    const params: unknown[] = [...workspaceIds];

    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }

    if (assigneeId) {
      conditions.push("assigneeId = ?");
      params.push(assigneeId);
    }

    if (dueFrom) {
      conditions.push("dueDate >= ?");
      params.push(dueFrom);
    }

    if (dueTo) {
      conditions.push("dueDate <= ?");
      params.push(dueTo);
    }

    // Build ORDER BY clause
    let orderBy = "createdAt DESC"; // default sort
    if (sortBy && ALLOWED_SORT_BY.has(sortBy)) {
      const order = sortOrder && ALLOWED_SORT_ORDER.has(sortOrder) ? sortOrder.toUpperCase() : "DESC";
      orderBy = `${sortBy} ${order}`;
    } else if (sortOrder && ALLOWED_SORT_ORDER.has(sortOrder)) {
      orderBy = `createdAt ${sortOrder.toUpperCase()}`;
    }

    const sql = `
      SELECT id, workspaceId, title, description, status, priority,
             assigneeId, dueDate, createdAt
      FROM tasks
      WHERE ${conditions.join(" AND ")}
      ORDER BY ${orderBy}
    `;

    const stmt = db.prepare(sql);
    const tasks = stmt.all(...params) as Task[];

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
