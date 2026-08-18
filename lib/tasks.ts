import { getDb } from "@/lib/db";
import type { Task } from "@/src/types/task";

/**
 * Returns tasks assigned to the given user whose dueDate falls
 * within the next 24 hours (from now).
 */
export function getUpcomingTasks(userId: string): Task[] {
  const db = getDb();
  const stmt = db.prepare(
    "SELECT * FROM tasks WHERE assigneeId = ? AND dueDate >= datetime('now') AND dueDate <= datetime('now', '+24 hours')"
  );
  return stmt.all(userId) as Task[];
}
