# TaskFlow — Collaborative Team Task Manager

TaskFlow is a real-time collaborative task management tool built for small teams. It provides role-based access control, project workspaces, task boards with priority levels, progress tracking, and threaded comments — all backed by a local SQLite database.

---

## Features

### Authentication & Users
- **User registration and login** via Better Auth
- **Session management** with secure HTTP-only cookies
- **Profile management** — update name, bio, timezone, and avatar
- **Avatar upload** with file-size validation (max 5 MB)

### Workspaces
- **Create and manage workspaces** — each workspace isolates its tasks and members
- **Workspace member management** — add and remove members
- **Role-based access control** — `owner`, `admin`, and `member` roles
- **Owner-only workspace deletion** — only the workspace owner can delete a workspace
- **Owner-only member removal** — only the workspace owner can remove members

### Tasks
- **Full task lifecycle** — create, view, edit, and delete tasks
- **Task statuses** — `todo`, `in_progress`, `review`, `done`, `blocked`
- **Priority levels** — `low`, `medium`, `high`, `urgent`
- **Task assignment** — assign tasks to workspace members
- **Due dates** — set and track deadlines
- **Task descriptions** — rich context for each task
- **Task filtering** — filter by status, assignee, and due-date range
- **Task sorting** — sort by due date, creation date, or priority (asc/desc)
- **Upcoming tasks** — view tasks approaching their due dates

### Comments
- **Threaded comments** on tasks — discuss details without leaving the task view
- **Nested replies** — parent/child comment threading
- **Comment author attribution** — see who wrote each comment

### Data & Storage
- **SQLite persistence** via `better-sqlite3` with WAL journal mode
- **Foreign-key enforcement** — referential integrity across all tables
- **Automatic migrations** — schema is applied on first connection
- **Structured error handling** — typed error classes for consistent API responses

### Developer Experience
- **TypeScript** throughout — full type safety across frontend, backend, and database layers
- **Tailwind CSS** — utility-first styling with a consistent design system
- **Jest tests** — unit tests for utilities, errors, and database logic
- **ESLint** — code quality enforcement

---

## Project Structure

```
TaskFlow/
├── app/
│   ├── api/                          # API route handlers
│   │   ├── auth/[...all]/route.ts    # Better Auth catch-all
│   │   ├── profile/route.ts          # GET/PATCH user profile
│   │   ├── upload/route.ts           # Avatar file upload
│   │   ├── tasks/                    # Task CRUD, filtering, upcoming
│   │   │   ├── route.ts              # List tasks (with filters)
│   │   │   ├── upcoming/route.ts     # Upcoming tasks
│   │   │   ├── [taskId]/route.ts     # Get / update single task
│   │   │   └── [taskId]/comments/route.ts  # Task comments
│   │   └── workspaces/               # Workspace CRUD, members, tasks
│   │       ├── route.ts              # List / create workspaces
│   │       ├── [id]/route.ts         # Get / delete workspace
│   │       ├── [id]/members/route.ts # List workspace members
│   │       ├── [id]/tasks/route.ts   # List workspace tasks
│   │       └── [id]/tasks/[taskId]/route.ts  # Update task in workspace
│   ├── login/page.tsx                # Login page
│   ├── register/page.tsx             # Registration page
│   ├── profile/page.tsx              # User profile page
│   ├── tasks/page.tsx                # All tasks view (filtered/sorted)
│   ├── tasks/[id]/page.tsx           # Task detail + comments
│   ├── workspaces/
│   │   ├── page.tsx                  # Workspace list
│   │   ├── new/page.tsx              # Create workspace
│   │   └── [id]/
│   │       ├── page.tsx              # Workspace board (tasks)
│   │       └── settings/page.tsx     # Workspace settings
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home / redirect
├── components/
│   ├── Navbar.tsx                    # Top navigation bar
│   ├── TaskCard.tsx                  # Task display card
│   ├── TaskForm.tsx                  # Create / edit task form
│   ├── TaskFilters.tsx               # Filter and sort controls
│   ├── AssigneeSelect.tsx            # Assignee dropdown
│   ├── CommentSection.tsx            # Task comment thread
│   ├── MemberList.tsx                # Workspace member list
│   └── UpcomingTasksBadge.tsx        # Upcoming tasks indicator
├── src/
│   ├── types/                        # TypeScript interfaces & types
│   │   ├── task.ts                   # Task, TaskStatus, TaskPriority
│   │   ├── workspace.ts              # Workspace, WorkspaceMember
│   │   ├── user.ts                   # User, UserRole, UserProfile
│   │   ├── comment.ts                # Comment, CreateCommentInput
│   │   ├── auth.ts                   # Session, AuthUser
│   │   ├── project.ts                # Project types
│   │   ├── team.ts                   # Team types
│   │   └── index.ts                  # Barrel export
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts              # getDb() singleton
│   │   │   ├── schema.ts             # CREATE TABLE statements
│   │   │   └── migrations.ts         # Auto-run migrations
│   │   ├── auth.ts                   # Better Auth instance
│   │   ├── auth/workspace.ts         # Workspace membership guards
│   │   ├── config.ts                 # App configuration loader
│   │   ├── errors.ts                 # Typed error classes
│   │   ├── error-handler.ts          # Global error handler
│   │   ├── logger.ts                 # Structured logger
│   │   └── utils.ts                  # Utility functions
│   └── __tests__/                    # Jest test suites
├── lib/
│   ├── auth.ts                       # Legacy auth helpers
│   ├── auth-client.ts                # Client-side auth client
│   ├── auth/config.ts                # Client auth config
│   ├── tasks.ts                      # Legacy task helpers
│   └── db.ts                         # Legacy db helpers
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── jest.config.ts
├── .env.example
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Authentication | Better Auth |
| Database | SQLite via better-sqlite3 |
| Styling | Tailwind CSS 4 |
| Data Fetching | SWR / React Query |
| Validation | Zod |
| Testing | Jest + ts-jest |
| Linting | ESLint 9 |

---

## Prerequisites

Before running TaskFlow in production, you will need:

- **Email/SMS Service** — Sign up for an email delivery service and set the API key in your `.env` file.
  - *Development alternative:* Console.log / file-based email stub for development.
- **Resend** — Sign up for [Resend](https://resend.com) and set `RESEND_API_KEY` in your environment variables to enable email notifications.
  - *Development alternative:* In-app notifications only; no external email service is used during development.

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-org/taskflow.git
cd taskflow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

At minimum, set:

- `AUTH_SECRET` — a strong random string (use `openssl rand -base64 32`)
- `AUTH_URL` — the public URL of your auth endpoint (e.g. `http://localhost:3000/api/auth`)
- `DATABASE_PATH` — path to the SQLite database file (defaults to `./data/taskflow.db`)
- `PORT` — server port (defaults to `3000`)
- `CORS_ORIGIN` — allowed CORS origin (defaults to `http://localhost:3000`)

### 4. Run database migrations

Migrations run automatically on first connection. No manual step required.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

### Getting Started

1. **Register** a new account at `/register`.
2. **Create a workspace** from the Workspaces page.
3. **Invite team members** to your workspace (they must register independently).
4. **Create tasks** within the workspace — set status, priority, assignee, and due date.
5. **Filter and sort** tasks using the controls on the Tasks page.
6. **Comment** on tasks to collaborate with your team.
7. **Track upcoming deadlines** via the upcoming tasks view.

### Role-Based Access

| Role | Permissions |
|------|------------|
| `owner` | Full control — can delete workspace, remove any member, manage all tasks |
| `admin` | Can manage tasks and members (cannot delete workspace) |
| `member` | Can create and edit assigned tasks, view workspace content |

---

## API Reference

All API routes require authentication unless otherwise noted.

### Workspaces

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/workspaces` | List workspaces the current user belongs to |
| `POST` | `/api/workspaces` | Create a new workspace |
| `GET` | `/api/workspaces/{id}` | Get workspace details |
| `DELETE` | `/api/workspaces/{id}` | Delete workspace (owner only) |
| `GET` | `/api/workspaces/{id}/members` | List workspace members |
| `DELETE` | `/api/workspaces/{workspaceId}/members` | Remove a member (owner only) |
| `GET` | `/api/workspaces/{id}/tasks` | List tasks in a workspace |
| `PATCH` | `/api/workspaces/{id}/tasks/{taskId}` | Update a task |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks` | List all tasks across user's workspaces (supports `status`, `assigneeId`, `dueFrom`, `dueTo`, `sortBy`, `sortOrder` query params) |
| `GET` | `/api/tasks/upcoming` | List upcoming tasks for the current user |
| `GET` | `/api/tasks/{taskId}` | Get a single task |
| `PUT` | `/api/tasks/{taskId}` | Update a single task |
| `GET` | `/api/tasks/{taskId}/comments` | List comments on a task |
| `POST` | `/api/tasks/{taskId}/comments` | Add a comment to a task |

### Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/profile` | Get current user profile |
| `PATCH` | `/api/profile` | Update current user profile |

### Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload an avatar image (multipart/form-data, max 5 MB) |

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST` | `/api/auth/*` | Better Auth catch-all (login, register, session, callback, etc.) |

---

## Running Tests

```bash
npm test
```

Run tests in watch mode during development:

```bash
npm run test:watch
```

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server (Next.js with Turbopack) |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Jest test suite |
| `npm run test:watch` | Run Jest in watch mode |

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
