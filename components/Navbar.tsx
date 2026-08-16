"use client";

import Link from "next/link";
import { UpcomingTasksBadge } from "./UpcomingTasksBadge";

export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold text-gray-900">
              TaskFlow
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/workspaces"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Workspaces
              </Link>
              <Link
                href="/profile"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Profile
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <UpcomingTasksBadge />
          </div>
        </div>
      </div>
    </nav>
  );
}
