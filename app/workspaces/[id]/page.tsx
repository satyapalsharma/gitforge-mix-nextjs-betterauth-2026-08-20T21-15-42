"use client";

import { useState, useEffect } from "react";
import type { Workspace, Task, User } from "@/types";

interface WorkspaceDetailProps {
  params: Promise<{ id: string }>;
}

export default function WorkspaceDetailPage({ params }: WorkspaceDetailProps) {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  useEffect(() => {
    params.then((resolved) => {
      setWorkspaceId(resolved.id);
    });
  }, [params]);

  useEffect(() => {
    if (!workspaceId) return;
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [workspaceRes, tasksRes, membersRes] = await Promise.all([
          fetch(`/api/workspaces/${workspaceId}`),
          fetch(`/api/workspaces/${workspaceId}/tasks`),
          fetch(`/api/workspaces/${workspaceId}/members`),
        ]);

        if (!workspaceRes.ok) {
          throw new Error("Failed to fetch workspace");
        }
        if (!tasksRes.ok) {
          throw new Error("Failed to fetch tasks");
        }
        if (!membersRes.ok) {
          throw new Error("Failed to fetch members");
        }

        if (!cancelled) {
          const workspaceData: Workspace = await workspaceRes.json();
          const tasksData: Task[] = await tasksRes.json();
          const membersData: User[] = await membersRes.json();
          setWorkspace(workspaceData);
          setTasks(tasksData);
          setMembers(membersData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "An error occurred");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!workspaceId || !title.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          dueDate: dueDate || undefined,
          assigneeId: assigneeId || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create task");
      }

      // Reset form
      setTitle("");
      setDescription("");
      setDueDate("");
      setAssigneeId("");
      setShowForm(false);

      // Refetch tasks
      const tasksRes = await fetch(`/api/workspaces/${workspaceId}/tasks`);
      if (tasksRes.ok) {
        const tasksData: Task[] = await tasksRes.json();
        setTasks(tasksData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading workspace...</p>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">{error || "Workspace not found"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{workspace.name}</h1>
            {workspace.description && (
              <p className="text-gray-600 mt-1">{workspace.description}</p>
            )}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            {showForm ? "Cancel" : "New Task"}
          </button>
        </div>

        {/* New Task Form */}
        {showForm && (
          <div className="bg-white rounded shadow p-4 mb-8">
            <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Task title *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded p-2 mb-4"
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded p-2 mb-4"
                rows={3}
              />
              <input
                type="date"
                placeholder="Due date (optional)"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full border rounded p-2 mb-4"
              />
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full border rounded p-2 mb-4"
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name || member.email}
                  </option>
                ))}
              </select>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <button
                type="submit"
                disabled={submitting || !title.trim()}
                className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Creating..." : "Create Task"}
              </button>
            </form>
          </div>
        )}

        {/* Task List */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Tasks</h2>
          {tasks.length === 0 ? (
            <div className="bg-white rounded shadow p-8 text-center">
              <p className="text-gray-500">No tasks yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded shadow p-4 flex items-start justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    {task.description && (
                      <p className="text-gray-600 mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      {task.dueDate && (
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      )}
                      {task.assigneeId && (
                        <span>
                          Assigned to:{" "}
                          {members.find((m) => m.id === task.assigneeId)?.name ||
                            members.find((m) => m.id === task.assigneeId)?.email ||
                            "Unknown"}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      task.status === "done"
                        ? "bg-green-100 text-green-800"
                        : task.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : task.status === "blocked"
                            ? "bg-red-100 text-red-800"
                            : task.status === "review"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {task.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
