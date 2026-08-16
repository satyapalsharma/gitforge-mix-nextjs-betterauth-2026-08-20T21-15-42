"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TaskStatus, TaskPriority } from "@/types/task";

export interface User {
  id: string;
  name: string;
}

export interface TaskFiltersProps {
  users: User[];
  initialStatus?: string;
  initialAssigneeId?: string;
  initialDueFrom?: string;
  initialDueTo?: string;
  initialSortBy?: string;
  initialSortOrder?: string;
}

export const TASK_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All" },
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

export const SORT_BY_OPTIONS: { value: string; label: string }[] = [
  { value: "dueDate", label: "Due Date" },
  { value: "createdAt", label: "Created Date" },
  { value: "priority", label: "Priority" },
];

export const SORT_ORDER_OPTIONS: { value: string; label: string }[] = [
  { value: "asc", label: "Ascending" },
  { value: "desc", label: "Descending" },
];

export default function TaskFilters({
  users,
  initialStatus = "",
  initialAssigneeId = "",
  initialDueFrom = "",
  initialDueTo = "",
  initialSortBy = "",
  initialSortOrder = "desc",
}: TaskFiltersProps) {
  const router = useRouter();

  const [status, setStatus] = useState(initialStatus);
  const [assigneeId, setAssigneeId] = useState(initialAssigneeId);
  const [dueFrom, setDueFrom] = useState(initialDueFrom);
  const [dueTo, setDueTo] = useState(initialDueTo);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (assigneeId) params.set("assigneeId", assigneeId);
    if (dueFrom) params.set("dueFrom", dueFrom);
    if (dueTo) params.set("dueTo", dueTo);
    if (sortBy) params.set("sortBy", sortBy);
    if (sortOrder) params.set("sortOrder", sortOrder);

    const query = params.toString();
    const url = query ? `/tasks?${query}` : "/tasks";
    router.push(url);
  }

  function handleReset() {
    setStatus("");
    setAssigneeId("");
    setDueFrom("");
    setDueTo("");
    setSortBy("");
    setSortOrder("desc");
    router.push("/tasks");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 p-4 bg-gray-100 rounded items-end">
      <div className="flex flex-col">
        <label htmlFor="status" className="mb-1 text-xs font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded p-2 text-sm"
        >
          {TASK_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label htmlFor="assigneeId" className="mb-1 text-xs font-medium text-gray-700">
          Assignee
        </label>
        <select
          id="assigneeId"
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          className="border rounded p-2 text-sm"
        >
          <option value="">All</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label htmlFor="dueFrom" className="mb-1 text-xs font-medium text-gray-700">
          Due From
        </label>
        <input
          id="dueFrom"
          type="date"
          value={dueFrom}
          onChange={(e) => setDueFrom(e.target.value)}
          className="border rounded p-2 text-sm"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="dueTo" className="mb-1 text-xs font-medium text-gray-700">
          Due To
        </label>
        <input
          id="dueTo"
          type="date"
          value={dueTo}
          onChange={(e) => setDueTo(e.target.value)}
          className="border rounded p-2 text-sm"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="sortBy" className="mb-1 text-xs font-medium text-gray-700">
          Sort By
        </label>
        <select
          id="sortBy"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded p-2 text-sm"
        >
          <option value="">None</option>
          {SORT_BY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label htmlFor="sortOrder" className="mb-1 text-xs font-medium text-gray-700">
          Sort Order
        </label>
        <select
          id="sortOrder"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border rounded p-2 text-sm"
        >
          {SORT_ORDER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
      >
        Apply
      </button>

      <button
        type="button"
        onClick={handleReset}
        className="rounded border px-4 py-2 text-sm hover:bg-gray-200"
      >
        Reset
      </button>
    </form>
  );
}
