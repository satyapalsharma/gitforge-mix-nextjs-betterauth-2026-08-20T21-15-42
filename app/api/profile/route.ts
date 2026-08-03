import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const user = db
      .prepare(
        "SELECT id, name, email, displayName, bio, avatarUrl FROM user WHERE id = ?"
      )
      .get(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: {
      displayName?: string;
      bio?: string;
      avatarUrl?: string;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { displayName, bio, avatarUrl } = body;

    // Validate provided fields
    if (displayName !== undefined) {
      if (typeof displayName !== "string") {
        return NextResponse.json(
          { error: "displayName must be a string" },
          { status: 400 }
        );
      }
      if (displayName.trim().length > 50) {
        return NextResponse.json(
          { error: "displayName must be at most 50 characters" },
          { status: 400 }
        );
      }
    }

    if (bio !== undefined) {
      if (typeof bio !== "string") {
        return NextResponse.json(
          { error: "bio must be a string" },
          { status: 400 }
        );
      }
      if (bio.trim().length > 500) {
        return NextResponse.json(
          { error: "bio must be at most 500 characters" },
          { status: 400 }
        );
      }
    }

    if (avatarUrl !== undefined) {
      if (typeof avatarUrl !== "string") {
        return NextResponse.json(
          { error: "avatarUrl must be a string" },
          { status: 400 }
        );
      }
      if (avatarUrl.trim().length > 200) {
        return NextResponse.json(
          { error: "avatarUrl must be at most 200 characters" },
          { status: 400 }
        );
      }
    }

    const db = getDb();
    const result = db
      .prepare(
        "UPDATE user SET displayName = ?, bio = ?, avatarUrl = ? WHERE id = ?"
      )
      .run(
        displayName ?? null,
        bio ?? null,
        avatarUrl ?? null,
        session.user.id
      );

    if (result.changes === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedUser = db
      .prepare(
        "SELECT id, name, email, displayName, bio, avatarUrl FROM user WHERE id = ?"
      )
      .get(session.user.id);

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("PATCH /api/profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
