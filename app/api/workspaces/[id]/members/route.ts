import { NextResponse } from "next/server";
import { getDb } from "@/src/lib/db/index";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

interface Member {
  id: string;
  name: string;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const workspaceId = params.id;

    const stmt = db.prepare(
      "SELECT id, name FROM users WHERE workspace_id = ? ORDER BY name ASC"
    );
    const members = stmt.all(workspaceId) as Member[];

    return NextResponse.json(members);
  } catch (error) {
    console.error("Failed to fetch workspace members:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspace members" },
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

    const workspaceId = params.id;

    const member = getDb()
      .prepare(
        "SELECT role FROM workspace_members WHERE workspaceId = ? AND userId = ?"
      )
      .get(workspaceId, session.user.id) as { role: string } | undefined;

    if (!member || member.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let body: { userId: string };
    try {
      body = (await request.json()) as { userId: string };
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const userId = typeof body.userId === "string" ? body.userId.trim() : "";

    if (userId.length === 0) {
      return NextResponse.json(
        { error: "userId is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const result = getDb()
      .prepare(
        "DELETE FROM workspace_members WHERE workspaceId = ? AND userId = ?"
      )
      .run(workspaceId, userId) as { changes: number };

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/workspaces/[id]/members:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
