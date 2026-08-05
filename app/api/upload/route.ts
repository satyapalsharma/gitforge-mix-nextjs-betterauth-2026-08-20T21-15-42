import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const AVATARS_DIR = join(process.cwd(), "public", "avatars");
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Ensure avatars directory exists
    try {
      mkdirSync(AVATARS_DIR, { recursive: true });
    } catch {
      // directory may already exist
    }

    // Generate unique filename
    const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
    const filename = `${crypto.randomUUID()}.${extension}`;
    const filepath = join(AVATARS_DIR, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    writeFileSync(filepath, buffer);

    return NextResponse.json({ url: `/avatars/${filename}` });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
