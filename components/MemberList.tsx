"use client";

import { useState } from "react";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface MemberListProps {
  members: Member[];
  workspaceId: string;
  currentUserRole: string;
}

export function MemberList({ members, workspaceId, currentUserRole }: MemberListProps) {
  const [localMembers, setLocalMembers] = useState<Member[]>(members);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (memberId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this member?"
    );
    if (!confirmed) return;

    setRemovingId(memberId);

    try {
      const response = await fetch(
        `/api/workspaces/${encodeURIComponent(workspaceId)}/members`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: memberId }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      setLocalMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to remove member");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="border rounded">
      {localMembers.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-2 border-b"
        >
          <div>
            <p className="font-medium">{member.name}</p>
            <p className="text-sm text-gray-500">{member.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 capitalize">{member.role}</span>
            {currentUserRole === "owner" && member.role !== "owner" && (
              <button
                onClick={() => handleRemove(member.id)}
                disabled={removingId === member.id}
                className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {removingId === member.id ? "Removing..." : "Remove"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
