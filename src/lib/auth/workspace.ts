import { getDb } from "@/lib/db";
import { ForbiddenError } from "@/src/lib/errors";

export async function verifyWorkspaceMembership(
  userId: string,
  workspaceId: string
): Promise<void> {
  const db = getDb();
  const member = db.prepare(
    `SELECT * FROM workspace_members WHERE userId = ? AND workspaceId = ?`
  ).get(userId, workspaceId);

  if (!member) {
    throw new ForbiddenError("You are not a member of this workspace");
  }
}

export async function verifyAssigneeInWorkspace(
  assigneeId: string,
  workspaceId: string
): Promise<void> {
  const db = getDb();
  const member = db.prepare(
    `SELECT * FROM workspace_members WHERE userId = ? AND workspaceId = ?`
  ).get(assigneeId, workspaceId);

  if (!member) {
    throw new ForbiddenError("Assignee is not a member of this workspace");
  }
}
