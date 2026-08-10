import { NextResponse } from "next/server";
import { getDb } from "@/src/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const workspaceId = params.id;

    const members = db
      .prepare(
        `SELECT id, email, name, role, workspace_id, created_at, updated_at
         FROM users
         WHERE workspace_id = ?
         ORDER BY created_at ASC`
      )
      .all(workspaceId) as Array<{
      id: string;
      email: string;
      name: string;
      role: string;
      workspace_id: string;
      created_at: string;
      updated_at: string;
    }>;

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Failed to fetch workspace members:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspace members" },
      { status: 500 }
    );
  }
}
