"use client";

import { useEffect, useState, useCallback } from "react";

type TaskStatus = "todo" | "in_progress" | "review" | "done" | "blocked";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: string;
  projectId: string;
  assigneeId?: string;
  reporterId: string;
  dueDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; activeBg: string; activeText: string; inactiveBg: string; badgeBg: string; badgeText: string }
> = {
  todo: {
    label: "Todo",
    activeBg: "bg-gray-500",
    activeText: "text-white",
    inactiveBg: "bg-gray-200",
    badgeBg: "bg-gray-100",
    badgeText: "text-gray-700",
  },
  in_progress: {
    label: "In Progress",
    activeBg: "bg-blue-500",
    activeText: "text-white",
    inactiveBg: "bg-gray-200",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
  },
  review: {
    label: "Review",
    activeBg: "bg-yellow-500",
    activeText: "text-white",
    inactiveBg: "bg-gray-200",
    badgeBg: "bg-yellow-100",
    badgeText: "text-yellow-700",
  },
  done: {
    label: "Done",
    activeBg: "bg-green-500",
    activeText: "text-white",
    inactiveBg: "bg-gray-200",
    badgeBg: "bg-green-100",
    badgeText: "text-green-700",
  },
  blocked: {
    label: "Blocked",
    activeBg: "bg-red-500",
    activeText: "text-white",
    inactiveBg: "bg-gray-200",
    badgeBg: "bg-red-100",
    badgeText: "text-red-700",
  },
};

const TOGGLE_STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];

export default function WorkspaceDetailPage({ params }: { params: { id: string } }) {
  const workspaceId = params.id;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/tasks`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to fetch tasks (${res.status})`);
      }
      const data = (await res.json()) as Task[];
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleStatusToggle = async (taskId: string, newStatus: TaskStatus) => {
    const previousTasks = tasks;
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    // Optimistic update
    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], status: newStatus };
    setTasks(updatedTasks);
    setUpdatingId(taskId);

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to update status (${res.status})`);
      }

      // Refetch to ensure consistency
      await fetchTasks();
    } catch (err) {
      // Revert on error
      setTasks(previousTasks);
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 text-lg">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-red-600 text-lg font-medium">Error: {error}</p>
        <button
          onClick={fetchTasks}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Workspace Tasks</h1>

      {tasks.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No tasks found in this workspace.</p>
        </div>
      ) : (
        <div>
          {tasks.map((task) => {
            const statusConfig = STATUS_CONFIG[task.status];
            const isUpdating = updatingId === task.id;

            return (
              <div
                key={task.id}
                className={`bg-white rounded-lg shadow p-4 mb-3 transition-opacity ${isUpdating ? "opacity-60" : "opacity-100"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{task.title}</h3>
                    {task.description && (
                      <p className="text-gray-600 text-sm mt-1 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                        {task.priority}
                      </span>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${statusConfig.badgeBg} ${statusConfig.badgeText}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs text-gray-500 mr-1">Status:</span>
                  <div className="flex rounded-md overflow-hidden border border-gray-200">
                    {TOGGLE_STATUSES.map((status) => {
                      const cfg = STATUS_CONFIG[status];
                      const isActive = task.status === status;

                      return (
                        <button
                          key={status}
                          onClick={() => handleStatusToggle(task.id, status)}
                          disabled={isUpdating}
                          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                            isActive
                              ? `${cfg.activeBg} ${cfg.activeText}`
                              : `${cfg.inactiveBg} text-gray-700 hover:bg-gray-300`
                          } ${isUpdating ? "cursor-not-allowed" : "cursor-pointer"}`}
                          title={cfg.label}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
