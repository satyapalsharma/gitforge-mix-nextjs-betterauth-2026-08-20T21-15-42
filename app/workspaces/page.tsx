"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
}

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await fetch("/api/workspaces");

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Failed to fetch workspaces.");
          return;
        }

        const data = (await res.json()) as Workspace[];
        setWorkspaces(data);
      } catch {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Workspaces</h1>
          <Link
            href="/workspaces/new"
            className="bg-blue-500 px-4 py-2 rounded text-white hover:bg-blue-600"
          >
            New Workspace
          </Link>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {workspaces.length === 0 ? (
          <div className="rounded border border-dashed border-gray-300 bg-white p-12 text-center">
            <p className="text-gray-500">No workspaces yet.</p>
            <Link
              href="/workspaces/new"
              className="mt-4 inline-block text-blue-500 hover:text-blue-600"
            >
              Create your first workspace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((workspace) => (
              <Link
                key={workspace.id}
                href={`/workspaces/${workspace.id}`}
                className="block bg-white rounded shadow p-4 transition hover:shadow-md"
              >
                <h2 className="mb-2 text-lg font-semibold text-gray-900">
                  {workspace.name}
                </h2>
                {workspace.description && (
                  <p className="mb-4 line-clamp-3 text-sm text-gray-600">
                    {workspace.description}
                  </p>
                )}
                <span className="text-xs text-gray-400">
                  Created {new Date(workspace.createdAt).toLocaleDateString()}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
