"use client";

import { useState, useEffect } from "react";
import { Task, TaskStatus, TaskPriority } from "@/src/types/task";
import { TaskForm } from "@/components/TaskForm";
import { TaskCard } from "@/components/TaskCard";

interface WorkspacePageProps {
  params: { id: string };
}

export default function WorkspacePage({ params }: WorkspacePageProps) {
  const workspaceId = params.id;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [errorTasks, setErrorTasks] = useState<string | null>(null);

  // Edit state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
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

  async function handleCreateTask(data: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assigneeId: string | null;
  }) {
    const response = await fetch(
      `/api/workspaces/${encodeURIComponent(workspaceId)}/tasks`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          assigneeId: data.assigneeId,
          reporterId: "current-user",
          projectId: "default-project",
        }),
      }
    );

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error ?? `HTTP ${response.status}`);
    }

    const created = (await response.json()) as Task;
    setTasks((prev) => [...prev, created]);
  }

  function startEdit(task: Task) {
    setEditingTaskId(task.id);
    setEditError(null);
  }

  function cancelEdit() {
    setEditingTaskId(null);
    setEditError(null);
  }

  async function saveEdit(taskId: string, data: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assigneeId: string | null;
  }) {
    const response = await fetch(
      `/api/workspaces/${encodeURIComponent(workspaceId)}/tasks/${encodeURIComponent(taskId)}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          assigneeId: data.assigneeId,
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
  }

  const editingTask = editingTaskId
    ? tasks.find((t) => t.id === editingTaskId)
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Workspace Tasks</h1>

      {/* Task Creation Form */}
      <section className="mb-8 rounded border p-4">
        <h2 className="mb-4 text-xl font-semibold">Create Task</h2>
        <TaskForm
          mode="create"
          workspaceId={workspaceId}
          onSubmit={handleCreateTask}
          submitLabel="Create Task"
        />
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
          {tasks.map((task) =>
            editingTaskId === task.id ? (
              <li key={task.id} className="rounded border p-4">
                <TaskForm
                  mode="edit"
                  workspaceId={workspaceId}
                  initialTask={editingTask ?? undefined}
                  onSubmit={(data) => saveEdit(task.id, data)}
                  submitLabel="Save"
                  onCancel={cancelEdit}
                />
                {editError && (
                  <p className="mt-2 text-sm text-red-600">{editError}</p>
                )}
              </li>
            ) : (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={startEdit}
              />
            )
          )}
        </ul>
      </section>
    </div>
  );
}
