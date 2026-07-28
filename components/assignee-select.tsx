"use client";

import { useEffect, useState } from "react";

interface Member {
  id: string;
  name: string;
}

interface AssigneeSelectProps {
  workspaceId: string;
  value: string | null;
  onChange: (userId: string | null) => void;
}

export function AssigneeSelect({
  workspaceId,
  value,
  onChange,
}: AssigneeSelectProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadMembers() {
      try {
        setLoading(true);
        setError(false);
        const response = await fetch(
          `/api/workspaces/${encodeURIComponent(workspaceId)}/members`
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = (await response.json()) as Member[];

        if (!cancelled) {
          setMembers(data);
        }
      } catch (err) {
        console.error("Failed to load members:", err);
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMembers();

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  const handleChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newValue = event.target.value;
    onChange(newValue === "" ? null : newValue);
  };

  if (loading) {
    return (
      <select
        disabled
        className="w-full border rounded p-2 bg-gray-100 text-gray-500"
      >
        <option>Loading...</option>
      </select>
    );
  }

  if (error) {
    return (
      <select disabled className="w-full border rounded p-2">
        <option value="">Failed to load members</option>
      </select>
    );
  }

  return (
    <select
      value={value ?? ""}
      onChange={handleChange}
      className="w-full border rounded p-2"
    >
      <option value="">Unassigned</option>
      {members.map((member) => (
        <option key={member.id} value={member.id}>
          {member.name}
        </option>
      ))}
    </select>
  );
}
