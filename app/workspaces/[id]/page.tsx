"use client";

import { useEffect, useState } from "react";

interface Member {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Workspace {
  id: string;
  name: string;
}

export default function WorkspaceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const workspaceId = params.id;
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadWorkspace() {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}`);
        if (!res.ok) throw new Error("Failed to fetch workspace");
        const data = await res.json();
        if (!cancelled) {
          setWorkspace(data.workspace);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      }
    }

    async function loadMembers() {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/members`);
        if (!res.ok) throw new Error("Failed to fetch members");
        const data = await res.json();
        if (!cancelled) {
          setMembers(data.members);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadWorkspace();
    loadMembers();

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  function getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function getRoleBadgeClasses(role: string): string {
    switch (role) {
      case "owner":
        return "bg-yellow-100 text-yellow-800";
      case "admin":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-gray-500">Loading workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          {workspace?.name ?? "Workspace"}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your workspace members and settings.
        </p>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          Members
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {members.length} member{members.length !== 1 ? "s" : ""} in this
          workspace.
        </p>

        <ul className="mt-4 divide-y divide-gray-200 dark:divide-gray-800">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex items-center gap-4 py-4"
            >
              <div
                className="flex w-8 h-8 items-center justify-center rounded-full bg-gray-300 text-sm font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                aria-hidden="true"
              >
                {getInitials(member.name)}
              </div>

              <div className="flex flex-1 flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
                  {member.name}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {member.email}
                </span>
              </div>

              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeClasses(
                  member.role
                )}`}
              >
                {member.role}
              </span>
            </li>
          ))}

          {members.length === 0 && (
            <li className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
              No members found.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
