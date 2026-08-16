import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export async function DELETE(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = params.workspaceId;

    const member = db
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

    const result = db
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
    console.error("Unexpected error in DELETE /api/workspaces/[workspaceId]/members:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
