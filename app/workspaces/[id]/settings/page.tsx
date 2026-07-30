"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface Workspace {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const workspaceId = params.id as string;

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkspace() {
      try {
        const response = await fetch(`/api/workspaces/${workspaceId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Workspace not found");
          } else if (response.status === 401) {
            setError("You must be logged in to view this page");
          } else {
            setError("Failed to load workspace");
          }
          return;
        }
        const data = (await response.json()) as Workspace;
        setWorkspace(data);
        setName(data.name);
        setDescription(data.description);
      } catch (err) {
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchWorkspace();
  }, [workspaceId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update workspace");
      }

      const updated = (await response.json()) as Workspace;
      setWorkspace(updated);
      setSuccess("Workspace updated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error && !workspace) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Workspace Settings
            </h1>
            <p className="text-gray-600 mb-8">
              Update your workspace details below.
            </p>

            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 rounded-md bg-green-50 p-4">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Workspace Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Max 100 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Max 500 characters
                </p>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
