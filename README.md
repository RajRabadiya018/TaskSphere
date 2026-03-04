# Task Sphere

A full-stack task management application with **Kanban board** support, built as a monorepo with a **Next.js 16** client and an **Express + MongoDB** server. Features JWT authentication, multiple dashboards, drag-and-drop Kanban boards, a paginated task list with server-side filtering, dark/light theme, and a responsive design.

---

## Features

### Authentication
- **Sign Up / Login** — JWT-based authentication with bcrypt password hashing.
- **Protected Routes** — All app routes require authentication; unauthenticated users are redirected to login.
- **Persistent Sessions** — Token stored in `localStorage` and auto-hydrated on page load.

### Dashboards
- **Multiple Dashboards** — Create, rename, and delete dashboards; each dashboard has its own Kanban board.
- **Default Columns** — Every new dashboard is auto-created with **ToDo**, **In Progress**, and **Done** columns.
- **Dashboard Selector** — Quick-switch between dashboards from the navbar.

### Kanban Board (`/board/:dashboardId`)
- **Drag-and-Drop** — Reorder tasks within columns and move tasks between columns using `@dnd-kit`.
- **Custom Columns** — Add, rename, reorder, and delete custom columns (default columns are protected).
- **Add Task Dialog** — Create tasks directly in a column from the board view.
- **Task Detail Modal** — Click a task card to view/edit full details in a modal overlay.
- **Star Tasks** — Toggle star/favorite status on individual tasks.
- **Search** — Filter board tasks with an animated search input.

### Task List (`/tasks`)
- **Summary Stats** — Overview cards showing total tasks, in-progress, completed, and overdue counts.
- **Server-Side Filtering** — Filter by status (column name), priority, dashboard, and free-text search.
- **Debounced Search** — API calls are debounced (300ms) for smooth filtering.
- **Paginated Grid** — Client-side pagination with configurable page size.
- **Task Detail Modal** — View, edit, and delete tasks from the list via a modal.

### Create Task (`/create`)
- **Full Form** — Title, description, priority, due date, tags, assignee, dashboard, and column selection.
- **Validation** — Title and due date required; field-level error messages.

### General
- **Dark / Light Mode** — Theme toggle in the navbar, persisted in `localStorage`.
- **Compact View** — Toggleable compact card layout.
- **Responsive Design** — Mobile-friendly navbar, adaptive layouts.
- **Skeleton Loading** — Shimmer placeholders while data is fetched.
- **Error Handling** — Error boundaries per route, global error banner, and 401 auto-redirect.

---

## Tech Stack

### Client (`/client`)

| Layer            | Technology                                                      |
| ---------------- | --------------------------------------------------------------- |
| Framework        | [Next.js 16](https://nextjs.org/) (App Router)                 |
| Language         | [TypeScript 5](https://www.typescriptlang.org/)                |
| Styling          | [Tailwind CSS 4](https://tailwindcss.com/)                     |
| UI Components    | [shadcn/ui](https://ui.shadcn.com/) + Radix UI                 |
| State Management | [Redux Toolkit](https://redux-toolkit.js.org/)                 |
| Drag & Drop      | [@dnd-kit](https://dndkit.com/)                                |
| HTTP Client      | [Axios](https://axios-http.com/)                               |
| Icons            | [Lucide React](https://lucide.dev/)                            |
| Fonts            | Geist Sans & Geist Mono (Google Fonts)                         |
| Linting          | ESLint 9 (flat config)                                         |

### Server (`/server`)

| Layer          | Technology                                          |
| -------------- | --------------------------------------------------- |
| Runtime        | [Node.js](https://nodejs.org/) + Express 4          |
| Language       | [TypeScript 5](https://www.typescriptlang.org/)     |
| Database       | [MongoDB Atlas](https://www.mongodb.com/atlas)      |
| ODM            | [Mongoose 8](https://mongoosejs.com/)               |
| Authentication | [JWT](https://jwt.io/) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| Dev Server     | [ts-node-dev](https://github.com/wclr/ts-node-dev)  |

---

## Project Structure

```
Task Manager/
├── README.md                          # This file
├── client/                            # Next.js 16 frontend
│   ├── app/                           # App Router pages
│   │   ├── layout.tsx                 # Root layout (providers, navbar, fonts)
│   │   ├── page.tsx                   # Dashboards page (home)
│   │   ├── globals.css                # Global styles & Tailwind directives
│   │   ├── global-error.tsx           # Top-level error boundary
│   │   ├── login/page.tsx             # Login page
│   │   ├── signup/page.tsx            # Sign up page
│   │   ├── create/page.tsx            # Create task form
│   │   ├── board/
│   │   │   └── [dashboardId]/
│   │   │       ├── page.tsx           # Kanban board page
│   │   │       └── error.tsx          # Board error boundary
│   │   └── tasks/
│   │       ├── layout.tsx             # Tasks layout (sidebar + filters)
│   │       ├── page.tsx               # Task list with stats
│   │       ├── loading.tsx            # Skeleton loading UI
│   │       ├── error.tsx              # Task list error boundary
│   │       └── [id]/
│   │           └── page.tsx           # Single task detail
│   ├── components/                    # React components
│   │   ├── AddTaskDialog.tsx          # Add task dialog (board view)
│   │   ├── AnimatedSearchInput.tsx    # Animated expanding search bar
│   │   ├── AppShell.tsx               # Root shell (navbar + ProtectedRoute)
│   │   ├── AuthLoader.tsx             # Hydrates auth token on mount
│   │   ├── ConfirmDialog.tsx          # Delete confirmation modal
│   │   ├── DashboardSelector.tsx      # Dashboard switcher dropdown
│   │   ├── ErrorBanner.tsx            # Dismissible error notification
│   │   ├── KanbanBoard.tsx            # dnd-kit Kanban board
│   │   ├── KanbanColumn.tsx           # Single Kanban column
│   │   ├── KanbanTaskCard.tsx         # Kanban task card
│   │   ├── LoadingSpinner.tsx         # Accessible spinner
│   │   ├── Navbar.tsx                 # Top navigation bar
│   │   ├── ProtectedRoute.tsx         # Auth guard wrapper
│   │   ├── StyledSelect.tsx           # Custom styled select
│   │   ├── TaskCard.tsx               # Task card (list view)
│   │   ├── TaskDetailModal.tsx        # Task detail modal overlay
│   │   ├── TaskDetailView.tsx         # Full task detail view
│   │   ├── TaskFiltersBar.tsx         # Filter sidebar controls
│   │   ├── TaskList.tsx               # Paginated task grid
│   │   ├── TaskStatusBadge.tsx        # Colored status badge
│   │   └── ui/                        # shadcn/ui primitives
│   ├── context/
│   │   └── ThemeContext.tsx            # Theme, sidebar & compact-view provider
│   ├── hooks/
│   │   ├── usePagination.ts           # Generic client-side pagination
│   │   ├── useTaskFilters.ts          # Debounced server-side task filtering
│   │   └── useTaskForm.ts             # Form state, validation & reset
│   ├── lib/
│   │   ├── api.ts                     # Axios instance with JWT interceptors
│   │   └── utils.ts                   # Utility helpers (cn)
│   ├── store/
│   │   ├── index.ts                   # Redux store configuration
│   │   ├── provider.tsx               # Client-side Redux Provider wrapper
│   │   ├── authSlice.ts               # Auth slice (signup, login, loadUser)
│   │   ├── dashboardSlice.ts          # Dashboards slice (CRUD)
│   │   ├── taskSlice.ts               # Board slice (Kanban: columns, tasks, drag-and-drop)
│   │   └── taskListSlice.ts           # Task list slice (flat list, filters, stats)
│   ├── types/
│   │   ├── task.ts                    # Task, TaskListItem, TaskStats
│   │   ├── board.ts                   # BoardData
│   │   ├── column.ts                  # Column
│   │   └── dashboard.ts              # Dashboard
│   ├── package.json
│   └── tsconfig.json
└── server/                            # Express + MongoDB backend
    ├── src/
    │   ├── index.ts                   # Express app entry point
    │   ├── config/
    │   │   └── db.ts                  # MongoDB Atlas connection
    │   ├── middleware/
    │   │   ├── auth.ts                # JWT verification middleware
    │   │   └── errorHandler.ts        # Global error handler
    │   ├── models/
    │   │   ├── User.ts                # User model (bcrypt hashing)
    │   │   ├── Dashboard.ts           # Dashboard model
    │   │   ├── Column.ts              # Column model (default/custom)
    │   │   └── Task.ts                # Task model (with auto-assigneeId)
    │   └── routes/
    │       ├── auth.ts                # POST /signup, POST /login, GET /me
    │       ├── dashboards.ts          # CRUD + GET /:id/board
    │       ├── columns.ts             # CRUD + PUT /reorder
    │       └── tasks.ts               # CRUD + /move, /star, /reorder, /stats
    ├── .env                           # Environment variables
    ├── package.json
    └── tsconfig.json
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (or yarn / pnpm)
- **MongoDB** — A MongoDB Atlas cluster (or local MongoDB instance)

### Environment Variables

Create a `.env` file in `server/` with:

```env
MONGODB_URI=your_mongodb_uri
PORT=5000
JWT_SECRET=your_secret
```

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd "Task Manager"

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Run Development Servers

Start both the server and client in separate terminals:

```bash
# Terminal 1 — Start the backend (http://localhost:5000)
cd server
npm run dev

# Terminal 2 — Start the frontend (http://localhost:3000)
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

### Client (`/client`)

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the Next.js development server |
| `npm run build` | Create an optimised production build |
| `npm run start` | Serve the production build           |
| `npm run lint`  | Run ESLint across the project        |

### Server (`/server`)

| Command         | Description                                  |
| --------------- | -------------------------------------------- |
| `npm run dev`   | Start the Express dev server (ts-node-dev)   |
| `npm run build` | Compile TypeScript to `dist/`                |
| `npm run start` | Run the compiled production server           |
| `npm run seed`  | Seed the database with sample data           |

---

## API Endpoints

All API routes are served from `http://localhost:5000/api`. All routes except auth require a `Bearer` token in the `Authorization` header.

### Health Check

| Method | Endpoint       | Description              |
| ------ | -------------- | ------------------------ |
| GET    | `/api/health`  | Server status check      |

**Signup Body:**

| Field      | Type   | Required |
| ---------- | ------ | -------- |
| `name`     | string | Yes      |
| `email`    | string | Yes      |
| `password` | string | Yes (≥6 chars) |

**Login Body:**

| Field      | Type   | Required |
| ---------- | ------ | -------- |
| `email`    | string | Yes      |
| `password` | string | Yes      |

### Dashboards (`/api/dashboards`)

All routes require authentication.

| Method | Endpoint                      | Description                                |
| ------ | ----------------------------- | ------------------------------------------ |
| GET    | `/api/dashboards`             | List all dashboards for the current user   |
| POST   | `/api/dashboards`             | Create a new dashboard (with default columns) |
| PUT    | `/api/dashboards/:id`         | Rename a dashboard                         |
| DELETE | `/api/dashboards/:id`         | Delete dashboard (cascades columns & tasks)|
| GET    | `/api/dashboards/:id/board`   | Get full board (dashboard + columns + tasks grouped by column) |

### Columns (`/api/columns`)

All routes require authentication.

| Method | Endpoint               | Description                                      |
| ------ | ---------------------- | ------------------------------------------------ |
| POST   | `/api/columns`         | Create a new custom column                       |
| PUT    | `/api/columns/:id`     | Rename a column (syncs `columnName` on tasks)    |
| DELETE | `/api/columns/:id`     | Delete a custom column (tasks move to ToDo)      |
| PUT    | `/api/columns/reorder` | Bulk reorder columns `[{ id, position }]`        |

### Tasks (`/api/tasks`)

All routes require authentication.

| Method | Endpoint                | Description                                                       |
| ------ | ----------------------- | ----------------------------------------------------------------- |
| GET    | `/api/tasks`            | List all tasks (with optional filters: `search`, `priority`, `status`, `dashboardId`) |
| POST   | `/api/tasks`            | Create a new task                                                 |
| GET    | `/api/tasks/stats`      | Get aggregated stats (total, overdue, counts by column)           |
| PUT    | `/api/tasks/reorder`    | Bulk reorder tasks `[{ id, position, columnId? }]`                |
| GET    | `/api/tasks/:id`        | Get a single task (populated with column & dashboard)             |
| PUT    | `/api/tasks/:id`        | Update task fields                                                |
| DELETE | `/api/tasks/:id`        | Delete a task                                                     |
| PUT    | `/api/tasks/:id/move`   | Move task to a different column/position                          |
| PUT    | `/api/tasks/:id/star`   | Toggle starred status                                             |

**Create Task Body:**

| Field         | Type     | Required | Default      |
| ------------- | -------- | -------- | ------------ |
| `columnId`    | string   | Yes      | —            |
| `dashboardId` | string   | Yes      | —            |
| `title`       | string   | Yes      | —            |
| `description` | string   | No       | `""`         |
| `priority`    | string   | No       | `"medium"`   |
| `dueDate`     | string   | No       | —            |
| `tags`        | string[] | No       | `[]`         |
| `assignedTo`  | string   | No       | `""`         |

---

## Pages & Routes

| Route                  | Auth     | Description                                      |
| ---------------------- | -------- | ------------------------------------------------ |
| `/login`               | Public   | Login page                                       |
| `/signup`              | Public   | Sign up page                                     |
| `/`                    | Protected| Dashboards home — create, rename, delete boards  |
| `/board/:dashboardId`  | Protected| Kanban board with drag-and-drop                  |
| `/tasks`               | Protected| Paginated task list with stats and filters        |
| `/tasks/:id`           | Protected| Single task detail page                           |
| `/create`              | Protected| Create task form                                 |

---

## State Management

The app uses **Redux Toolkit** with four slices:

| Slice             | File                   | Purpose                                              |
| ----------------- | ---------------------- | ---------------------------------------------------- |
| `auth`            | `store/authSlice.ts`   | JWT authentication (signup, login, hydration, logout) |
| `dashboards`      | `store/dashboardSlice.ts` | Dashboard CRUD and active dashboard selection      |
| `board`           | `store/taskSlice.ts`   | Kanban board state (columns, tasks, drag-and-drop)   |
| `taskList`        | `store/taskListSlice.ts` | Flat task list, filters, stats, and selected task   |

### Key State Shapes

```ts
// Auth
interface AuthState {
  user: AuthUser | null;
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Board (Kanban)
interface BoardState {
  columns: Column[];
  tasks: Record<string, Task[]>; // columnId → Task[]
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// Task List
interface TaskListState {
  tasks: TaskListItem[];
  selectedTask: TaskListItem | null;
  filters: TaskFilters; // { search, priority, status, dashboardId }
  stats: TaskStats | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}
```

---

## Data Models

### User

```ts
interface User {
  _id: string;
  name: string;
  email: string;
  password: string; // bcrypt hashed, excluded from JSON
  createdAt: Date;
}
```

### Dashboard

```ts
interface Dashboard {
  _id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
```

### Column

```ts
interface Column {
  _id: string;
  dashboardId: string;
  name: string;
  type: "default" | "custom";
  position: number;
  createdAt: string;
  updatedAt: string;
}
```

### Task

```ts
interface Task {
  _id: string;
  columnId: string;
  columnName: string;
  dashboardId: string;
  userId: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  tags: string[];
  assignedTo: string;
  assigneeId?: string; // Auto-generated, consistent per assignee name
  position: number;
  starred: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## Custom Hooks

| Hook             | Purpose                                                                      |
| ---------------- | ---------------------------------------------------------------------------- |
| `useTaskForm`    | Manages form values, validation (title & due date required), and reset.      |
| `useTaskFilters` | Debounced server-side task filtering via Redux dispatch (300ms debounce).     |
| `usePagination`  | Generic pagination logic — page navigation, clamping, and slicing.           |

---

## Components

| Component              | Description                                                          |
| ---------------------- | -------------------------------------------------------------------- |
| `AppShell`             | Root shell wrapping Navbar + ProtectedRoute.                         |
| `AuthLoader`           | Hydrates JWT token from `localStorage` on mount.                     |
| `Navbar`               | Sticky top bar with navigation, dashboard selector, theme toggle, and logout. |
| `ProtectedRoute`       | Auth guard — redirects unauthenticated users to `/login`.            |
| `DashboardSelector`    | Dropdown to switch between dashboards and navigate to board.         |
| `KanbanBoard`          | Drag-and-drop board powered by `@dnd-kit`.                           |
| `KanbanColumn`         | Single column with add/rename/delete actions.                        |
| `KanbanTaskCard`       | Draggable task card for the Kanban view.                             |
| `AddTaskDialog`        | Modal dialog to create a task directly in a column.                  |
| `TaskDetailModal`      | Full task detail modal with edit/delete/star actions.                 |
| `AnimatedSearchInput`  | Expanding animated search bar.                                       |
| `TaskCard`             | Task card for the list view.                                         |
| `TaskList`             | Paginated grid of `TaskCard` components.                             |
| `TaskFiltersBar`       | Search + status/priority/dashboard filter controls.                  |
| `TaskDetailView`       | Full task detail view with edit/delete actions.                      |
| `TaskStatusBadge`      | Colored badge for column status.                                     |
| `ConfirmDialog`        | Radix-based modal for confirming destructive actions.                |
| `ErrorBanner`          | Dismissible error notification bar.                                  |
| `LoadingSpinner`       | Accessible spinner in `sm`, `md`, `lg` sizes.                        |
| `StyledSelect`         | Custom styled select dropdown.                                       |

---

## Theming

Theme is managed via `context/ThemeContext.tsx`:

- **Dark / Light mode** — Toggled from the navbar; preference saved in `localStorage`.
- **Sidebar visibility** — Collapsible sidebar with mobile overlay.
- **Compact view** — Toggleable compact card layout.

The `<html>` element receives the `dark` class and `data-theme` attribute, integrating with Tailwind's dark-mode utilities.

---

## License

This project is for learning and practice purposes.
