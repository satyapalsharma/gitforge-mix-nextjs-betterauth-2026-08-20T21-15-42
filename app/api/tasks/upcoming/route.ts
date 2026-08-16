import { auth } from "lib/auth.ts";
import { getUpcomingTasks } from "lib/tasks.ts";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tasks = getUpcomingTasks(session.user.id);
  return Response.json({ count: tasks.length });
}
