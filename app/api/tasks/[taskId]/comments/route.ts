import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { auth } from "@/lib/auth/config";
import { verifyWorkspaceMembership } from "@/lib/auth/workspace";
import type { Comment, CreateCommentInput } from "@/types/comment";

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

    // Verify task exists
    const task = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(taskId) as any;

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Verify workspace membership
    await verifyWorkspaceMembership(session.user.id, task.workspaceId);

    // Fetch comments with user names
    const comments = db
      .prepare(
        `SELECT c.id, c.task_id, c.user_id, c.content, c.parent_id, c.created_at, u.name as userName
         FROM comments c
         LEFT JOIN users u ON c.user_id = u.id
         WHERE c.task_id = ?
         ORDER BY c.created_at ASC`
      )
      .all(taskId) as any[];

    const result: Comment[] = comments.map((row) => ({
      id: row.id,
      taskId: row.task_id,
      userId: row.user_id,
      content: row.content,
      parentId: row.parent_id,
      createdAt: row.created_at,
      userName: row.userName || undefined,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/tasks/[taskId]/comments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
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

    // Verify task exists
    const task = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(taskId) as any;

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Verify workspace membership
    await verifyWorkspaceMembership(session.user.id, task.workspaceId);

    const body = (await request.json()) as CreateCommentInput;

    if (!body.content || typeof body.content !== "string" || body.content.trim() === "") {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    // If parentId is provided, verify it belongs to the same task
    if (body.parentId) {
      const parentComment = db
        .prepare("SELECT * FROM comments WHERE id = ? AND task_id = ?")
        .get(body.parentId, taskId);

      if (!parentComment) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          { status: 404 }
        );
      }
    }

    const stmt = db.prepare(
      `INSERT INTO comments (id, task_id, user_id, content, parent_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    );

    stmt.run(id, taskId, session.user.id, body.content.trim(), body.parentId || null, now);

    // Fetch the created comment with user name
    const createdComment = db
      .prepare(
        `SELECT c.id, c.task_id, c.user_id, c.content, c.parent_id, c.created_at, u.name as userName
         FROM comments c
         LEFT JOIN users u ON c.user_id = u.id
         WHERE c.id = ?`
      )
      .get(id) as any;

    const result: Comment = {
      id: createdComment.id,
      taskId: createdComment.task_id,
      userId: createdComment.user_id,
      content: createdComment.content,
      parentId: createdComment.parent_id,
      createdAt: createdComment.created_at,
      userName: createdComment.userName || undefined,
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks/[taskId]/comments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
