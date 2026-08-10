import { NextResponse } from "next/server";
import { getDb } from "@/src/lib/db/index";

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
