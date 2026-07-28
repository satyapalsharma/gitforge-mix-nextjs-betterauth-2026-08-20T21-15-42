"use client";

import { useState, useEffect } from "react";
import { AssigneeSelect } from "@/components/assignee-select";
import { Task, TaskStatus, TaskPriority } from "@/src/types/task";

interface WorkspacePageProps {
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

export default function WorkspacePage({ params }: WorkspacePageProps) {
  const workspaceId = params.id;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [errorTasks, setErrorTasks] = useState<string | null>(null);

  // Create form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit form state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<TaskStatus>("todo");
  const [editPriority, setEditPriority] = useState<TaskPriority>("medium");
  const [editAssigneeId, setEditAssigneeId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTasks() {
      try {
        setLoadingTasks(true);
        setErrorTasks(null);
        const response = await fetch(
          `/api/workspaces/${encodeURIComponent(workspaceId)}/tasks`
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = (await response.json()) as Task[];
        setTasks(data);
      } catch (err) {
        console.error("Failed to load tasks:", err);
        setErrorTasks("Failed to load tasks");
      } finally {
        setLoadingTasks(false);
      }
    }

    loadTasks();
  }, [workspaceId]);

  async function handleCreateTask(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    setCreateError(null);

    try {
      const response = await fetch(
        `/api/workspaces/${encodeURIComponent(workspaceId)}/tasks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            status,
            priority,
            assigneeId,
            reporterId: "current-user", // placeholder; replace with real user id
            projectId: "default-project", // placeholder; replace with real project id
          }),
        }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${response.status}`);
      }

      const created = (await response.json()) as Task;
      setTasks((prev) => [...prev, created]);

      // Reset form
      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority("medium");
      setAssigneeId(null);
    } catch (err) {
      console.error("Failed to create task:", err);
      setCreateError(
        err instanceof Error ? err.message : "Failed to create task"
      );
    } finally {
      setCreating(false);
    }
  }

  function startEdit(task: Task) {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
    setEditStatus(task.status);
    setEditPriority(task.priority);
    setEditAssigneeId(task.assigneeId ?? null);
    setEditError(null);
  }

  function cancelEdit() {
    setEditingTaskId(null);
    setEditError(null);
  }

  async function saveEdit(event: React.FormEvent) {
    event.preventDefault();
    if (!editingTaskId) return;

    setSaving(true);
    setEditError(null);

    try {
      const response = await fetch(
        `/api/workspaces/${encodeURIComponent(workspaceId)}/tasks/${encodeURIComponent(editingTaskId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editTitle,
            description: editDescription,
            status: editStatus,
            priority: editPriority,
            assigneeId: editAssigneeId,
          }),
        }
      );

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${response.status}`);
      }

      const updated = (await response.json()) as Task;
      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      cancelEdit();
    } catch (err) {
      console.error("Failed to update task:", err);
      setEditError(
        err instanceof Error ? err.message : "Failed to update task"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Workspace Tasks</h1>

      {/* Task Creation Form */}
      <section className="mb-8 rounded border p-4">
        <h2 className="mb-4 text-xl font-semibold">Create Task</h2>
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border rounded p-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
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
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
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

          <div>
            <label className="mb-1 block text-sm font-medium">Assignee</label>
            <AssigneeSelect
              workspaceId={workspaceId}
              value={assigneeId}
              onChange={setAssigneeId}
            />
          </div>

          {createError && (
            <p className="text-sm text-red-600">{createError}</p>
          )}

          <button
            type="submit"
            disabled={creating}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Task"}
          </button>
        </form>
      </section>

      {/* Task List */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">Tasks</h2>

        {loadingTasks && <p>Loading tasks...</p>}
        {errorTasks && <p className="text-red-600">{errorTasks}</p>}

        {!loadingTasks && !errorTasks && tasks.length === 0 && (
          <p>No tasks yet.</p>
        )}

        <ul className="space-y-4">
          {tasks.map((task) => (
            <li key={task.id} className="rounded border p-4">
              {editingTaskId === task.id ? (
                /* Edit Form */
                <form onSubmit={saveEdit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Title
                    </label>
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
                      rows={3}
                      className="w-full border rounded p-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Status
                      </label>
                      <select
                        value={editStatus}
                        onChange={(e) =>
                          setEditStatus(e.target.value as TaskStatus)
                        }
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
                      <label className="mb-1 block text-sm font-medium">
                        Priority
                      </label>
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

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Assignee
                    </label>
                    <AssigneeSelect
                      workspaceId={workspaceId}
                      value={editAssigneeId}
                      onChange={setEditAssigneeId}
                    />
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
                      onClick={cancelEdit}
                      className="rounded border px-4 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                /* Task Display */
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{task.title}</h3>
                      <p className="text-sm text-gray-600">
                        {task.description}
                      </p>
                    </div>
                    <button
                      onClick={() => startEdit(task)}
                      className="rounded border px-3 py-1 text-sm"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="mt-2 flex gap-4 text-sm">
                    <span>
                      Status: {TASK_STATUSES.find((s) => s.value === task.status)?.label}
                    </span>
                    <span>
                      Priority: {TASK_PRIORITIES.find((p) => p.value === task.priority)?.label}
                    </span>
                    <span>
                      Assignee: {task.assigneeId ?? "Unassigned"}
                    </span>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
