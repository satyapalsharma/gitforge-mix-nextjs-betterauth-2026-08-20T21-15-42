"use client";

import { useState, useEffect, FormEvent } from "react";
import { Task, TaskStatus, TaskPriority } from "@/src/types/task";
import CommentSection from "@/components/CommentSection";

interface TaskDetailPageProps {
  params: { id: string };
}

const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
  { value: "blocked", label: "Blocked" },
];

const TASK_PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  const taskId = params.id;

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<TaskStatus>("todo");
  const [editPriority, setEditPriority] = useState<TaskPriority>("medium");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTask() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `/api/tasks/${encodeURIComponent(taskId)}`
        );
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = (await response.json()) as Task;
        setTask(data);
        setEditTitle(data.title);
        setEditDescription(data.description ?? "");
        setEditStatus(data.status);
        setEditPriority(data.priority ?? "medium");
      } catch (err) {
        console.error("Failed to load task:", err);
        setError("Failed to load task");
      } finally {
        setLoading(false);
      }
    }

    loadTask();
  }, [taskId]);

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (!task) return;

    setSaving(true);
    setEditError(null);

    try {
      const response = await fetch(
        `/api/tasks/${encodeURIComponent(taskId)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editTitle,
            description: editDescription,
            status: editStatus,
            priority: editPriority,
          }),
        }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${response.status}`);
      }

      const updated = (await response.json()) as Task;
      setTask(updated);
      setEditing(false);
    } catch (err) {
      console.error("Failed to update task:", err);
      setEditError(
        err instanceof Error ? err.message : "Failed to update task"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">Loading task...</div>
    );
  }

  if (error || !task) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-red-600">{error ?? "Task not found"}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Task header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{task.title}</h1>
        <div className="mt-2 flex flex-wrap gap-4 text-sm">
          <span>
            Status: {TASK_STATUSES.find((s) => s.value === task.status)?.label}
          </span>
          <span>
            Priority: {TASK_PRIORITIES.find((p) => p.value === task.priority)
              ?.label ?? "—"}
          </span>
        </div>
      </div>

      {/* Task body: view or edit */}
      {editing ? (
        <form onSubmit={handleSaveEdit} className="mb-8 space-y-4 rounded border p-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              rows={4}
              className="w-full border rounded p-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                className="w-full border rounded p-2"
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Priority</label>
              <select
                value={editPriority}
                onChange={(e) =>
                  setEditPriority(e.target.value as TaskPriority)
                }
                className="w-full border rounded p-2"
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {editError && (
            <p className="text-sm text-red-600">{editError}</p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded border px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 rounded border p-4">
          <p className="whitespace-pre-wrap">{task.description}</p>
          <button
            onClick={() => setEditing(true)}
            className="mt-4 rounded border px-3 py-1 text-sm"
          >
            Edit
          </button>
        </div>
      )}

      {/* Comment section */}
      <CommentSection taskId={taskId} />
    </div>
  );
}
