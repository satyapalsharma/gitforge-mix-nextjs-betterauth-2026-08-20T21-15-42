"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { TaskPriority } from "@/src/types/task";

export const PRIORITY_OPTIONS: { value: TaskPriority | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

interface TaskFiltersProps {
  className?: string;
}

export function TaskFilters({ className }: TaskFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPriority = (searchParams.get("priority") as TaskPriority | null) ?? "all";

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete("priority");
    } else {
      params.set("priority", value);
    }

    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : window.location.pathname);
  }

  return (
    <select
      value={currentPriority}
      onChange={handleChange}
      className={`border rounded p-2 ${className ?? ""}`}
    >
      {PRIORITY_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
