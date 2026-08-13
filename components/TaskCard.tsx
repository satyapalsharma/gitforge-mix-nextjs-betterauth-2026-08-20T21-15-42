"use client";

import { Task, TaskStatus, TaskPriority } from "@/src/types/task";

export const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
  { value: "blocked", label: "Blocked" },
];

export const TASK_PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-red-100 text-red-800 border-red-200",
  urgent: "bg-purple-100 text-purple-800 border-purple-200",
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const priorityLabel =
    TASK_PRIORITIES.find((p) => p.value === task.priority)?.label ??
    task.priority ??
    "None";
  const statusLabel =
    TASK_STATUSES.find((s) => s.value === task.status)?.label ??
    task.status;

  return (
    <li className="rounded border p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-medium">{task.title}</h3>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${PRIORITY_COLORS[task.priority ?? "medium"]}`}
            >
              {priorityLabel}
            </span>
          </div>
          {task.description && (
            <p className="mt-1 text-sm text-gray-600">{task.description}</p>
          )}
        </div>
        <button
          onClick={() => onEdit(task)}
          className="ml-4 rounded border px-3 py-1 text-sm"
        >
          Edit
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
        <span>Status: {statusLabel}</span>
        <span>Priority: {priorityLabel}</span>
        <span>Assignee: {task.assigneeId ?? "Unassigned"}</span>
      </div>
    </li>
  );
}
