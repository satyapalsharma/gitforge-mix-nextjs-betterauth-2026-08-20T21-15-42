"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { TaskFilters } from "@/components/TaskFilters";
import type { Task } from "@/src/types/task";

const TASK_STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
  blocked: "Blocked",
};

const TASK_PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

function TasksPageContent() {
  const searchParams = useSearchParams();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [errorTasks, setErrorTasks] = useState<string | null>(null);

  // Read filters from URL
  const status = searchParams.get("status") ?? "";
  const assigneeId = searchParams.get("assigneeId") ?? "";
  const dueFrom = searchParams.get("dueFrom") ?? "";
  const dueTo = searchParams.get("dueTo") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "";
  const sortOrder = searchParams.get("sortOrder") ?? "desc";

  const loadTasks = useCallback(async () => {
    try {
      setLoadingTasks(true);
      setErrorTasks(null);

      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (assigneeId) params.set("assigneeId", assigneeId);
      if (dueFrom) params.set("dueFrom", dueFrom);
      if (dueTo) params.set("dueTo", dueTo);
      if (sortBy) params.set("sortBy", sortBy);
      if (sortOrder) params.set("sortOrder", sortOrder);

      const query = params.toString();
      const url = query ? `/api/tasks?${query}` : "/api/tasks";

      const response = await fetch(url);
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
  }, [status, assigneeId, dueFrom, dueTo, sortBy, sortOrder]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Tasks</h1>

      <TaskFilters />

      <section className="mt-6">
        {loadingTasks && <p>Loading tasks...</p>}
        {errorTasks && <p className="text-red-600">{errorTasks}</p>}

        {!loadingTasks && !errorTasks && tasks.length === 0 && (
          <p>No tasks found.</p>
        )}

        <ul className="mt-4 space-y-4">
          {tasks.map((task) => (
            <li key={task.id} className="rounded border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-gray-600">{task.description}</p>
                  )}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-4 text-sm">
                <span>
                  Status: {TASK_STATUS_LABELS[task.status] ?? task.status}
                </span>
                {task.priority && (
                  <span>
                    Priority: {TASK_PRIORITY_LABELS[task.priority] ?? task.priority}
                  </span>
                )}
                <span>
                  Assignee: {task.assigneeId ?? "Unassigned"}
                </span>
                {task.dueDate && (
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                )}
                <span>
                  Created: {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TasksPageContent />
    </Suspense>
  );
}
