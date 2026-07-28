import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);

    if (
      !body ||
      typeof body.name !== "string" ||
      typeof body.description !== "string" ||
      (body.description !== undefined && body.description !== null)
    ) {
      // Allow description to be string or undefined/null
      if (
        !body ||
        typeof body.name !== "string"
      ) {
        return NextResponse.json(
          { error: "Invalid request body. Expected { name: string, description?: string }" },
          { status: 400 }
        );
      }
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : undefined;

    if (name.length === 0) {
      return NextResponse.json(
        { error: "Name is required and must not be empty." },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: "Name must be at most 100 characters." },
        { status: 400 }
      );
    }

    const id = crypto.randomUUID();
    const db = getDb();

    const insertWorkspace = db.prepare(
      "INSERT INTO workspaces (id, name, description, ownerId) VALUES (?, ?, ?, ?)"
    );
    const insertMember = db.prepare(
      "INSERT INTO workspace_members (workspaceId, userId, role) VALUES (?, ?, ?)"
    );

    const tx = db.transaction(() => {
      insertWorkspace.run(id, name, description ?? null, session.user.id);
      insertMember.run(id, session.user.id, "owner");
    });

    try {
      tx();
    } catch (error) {
      console.error("Database transaction failed:", error);
      return NextResponse.json(
        { error: "Failed to create workspace." },
        { status: 500 }
      );
    }

    const workspace = {
      id,
      name,
      description: description ?? null,
      ownerId: session.user.id,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    console.error("Unexpected error in POST /api/workspaces:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
