"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface WorkspaceSettingsPageProps {
  params: {
    id: string;
  };
}

export default function WorkspaceSettingsPage({ params }: WorkspaceSettingsPageProps) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/workspaces/${params.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete workspace");
      }

      router.push("/workspaces");
    } catch (error) {
      alert(error instanceof Error ? error.message : "An error occurred");
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Workspace Settings</h1>

      {/* Existing settings content would go here */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">General</h2>
        {/* Settings form fields */}
      </div>

      {/* Delete Workspace Section */}
      <div className="bg-white shadow rounded-lg p-6 border-t-4 border-red-500">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
        <p className="text-gray-600 mb-4">
          Once you delete a workspace, there is no going back. Please be certain.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Delete Workspace
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Delete Workspace</h3>
            <p className="text-gray-700 mb-2">
              Are you sure you want to delete <span className="font-semibold">{workspaceName || "this workspace"}</span>?
            </p>
            <p className="text-gray-600 mb-6">
              This will permanently delete the workspace and all its tasks. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
