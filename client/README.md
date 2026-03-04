# Task Sphere

A full-stack task management application built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, and **Redux Toolkit**. Features a dashboard with real-time stats, full CRUD operations, filtering, pagination, dark/light theme, and a responsive sidebar layout.

---

## Features

- **Dashboard** — Overview cards showing total tasks, in-progress, completed, and overdue counts with the 6 most recent tasks.
- **Create Task** — Form with validation for title, description, priority, status, due date, tags, and assignee.
- **Edit Task** — Pre-populated form to update any task field.
- **Task Detail** — Full detail view with status badge, priority indicator, overdue warning, and delete confirmation dialog.
- **Task List** — Paginated grid (9 per page) with a collapsible filter sidebar.
- **Filtering** — Filter tasks by status (`todo`, `in-progress`, `done`), priority (`low`, `medium`, `high`), and free-text search.
- **Dark / Light Mode** — Theme toggle persisted in `localStorage`.
- **Responsive Design** — Mobile sidebar overlay, adaptive grid layouts, and compact card mode.
- **Skeleton Loading** — Shimmer placeholders while data is fetched.
- **Error Boundary** — Dedicated error page with retry option for the tasks route.

---

## Tech Stack

| Layer            | Technology                                      |
| ---------------- | ----------------------------------------------- |
| Framework        | [Next.js 16](https://nextjs.org/) (App Router)  |
| Language         | [TypeScript 5](https://www.typescriptlang.org/) |
| Styling          | [Tailwind CSS 4](https://tailwindcss.com/)      |
| UI Components    | [shadcn/ui](https://ui.shadcn.com/) + Radix UI  |
| State Management | [Redux Toolkit](https://redux-toolkit.js.org/)  |
| Icons            | [Lucide React](https://lucide.dev/)             |
| ID Generation    | `crypto.randomUUID()` / `uuid`                  |
| Linting          | ESLint 9 (flat config)                          |
| Fonts            | Geist Sans & Geist Mono (Google Fonts)          |

---

## Project Structure

```
task-manager/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (providers, navbar, fonts)
│   ├── page.tsx                  # Dashboard page
│   ├── globals.css               # Global styles & Tailwind directives
│   ├── api/
│   │   └── tasks/
│   │       ├── route.ts          # GET (list + filter) & POST (create)
│   │       └── [id]/
│   │           └── route.ts      # GET, PUT, DELETE by task ID
│   ├── create/
│   │   └── page.tsx              # Create task form
│   └── tasks/
│       ├── layout.tsx            # Sidebar + filters layout
│       ├── page.tsx              # Task list (server component)
│       ├── loading.tsx           # Skeleton loading UI
│       ├── error.tsx             # Error boundary
│       └── [id]/
│           ├── page.tsx          # Task detail (server component)
│           └── edit/
│               └── page.tsx      # Edit task form
├── components/                   # Reusable React components
│   ├── ConfirmDialog.tsx         # Delete confirmation modal
│   ├── LoadingSpinner.tsx        # Accessible spinner with sizes
│   ├── Navbar.tsx                # Top navigation bar
│   ├── TaskCard.tsx              # Task card with status, priority & tags
│   ├── TaskDetailView.tsx        # Full task detail view
│   ├── TaskFiltersBar.tsx        # Sidebar filter controls
│   ├── TaskList.tsx              # Paginated task grid
│   ├── TaskStatusBadge.tsx       # Colored status badge
│   └── ui/                       # shadcn/ui primitives
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       └── textarea.tsx
├── context/
│   └── ThemeContext.tsx           # Theme, sidebar & compact-view provider
├── hooks/
│   ├── usePagination.ts          # Generic client-side pagination
│   ├── useTaskFilters.ts         # Memoized Redux-based task filtering
│   └── useTaskForm.ts            # Form state, validation & reset
├── lib/
│   ├── tasks.ts                  # In-memory task store (seeded data)
│   └── utils.ts                  # Utility helpers (cn)
├── store/
│   ├── index.ts                  # Redux store configuration
│   ├── provider.tsx              # Client-side Redux Provider wrapper
│   └── taskSlice.ts              # Tasks slice (async thunks + reducers)
├── types/
│   └── task.ts                   # Task, TaskPriority, TaskStatus, TaskFilters
├── public/                       # Static assets
├── components.json               # shadcn/ui config
├── eslint.config.mjs             # ESLint flat config
├── next.config.ts                # Next.js config
├── postcss.config.mjs            # PostCSS config (Tailwind)
├── tsconfig.json                 # TypeScript config
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm**, **yarn**, or **pnpm**

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd task-manager

# Install dependencies
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the development server         |
| `npm run build` | Create an optimised production build |
| `npm run start` | Serve the production build           |
| `npm run lint`  | Run ESLint across the project        |

---

## API Endpoints

All API routes are implemented as Next.js Route Handlers under `app/api/tasks/`. Data is stored in-memory (resets on server restart).

### `GET /api/tasks`

Returns all tasks. Supports optional query parameters:

| Param      | Type   | Description                                      |
| ---------- | ------ | ------------------------------------------------ |
| `status`   | string | Filter by status (`todo`, `in-progress`, `done`) |
| `priority` | string | Filter by priority (`low`, `medium`, `high`)     |
| `search`   | string | Search title and description (case-insensitive)  |

**Response:** `200` — `Task[]`

### `POST /api/tasks`

Create a new task.

| Field         | Type     | Required | Default    |
| ------------- | -------- | -------- | ---------- |
| `title`       | string   | Yes      | —          |
| `description` | string   | No       | `""`       |
| `priority`    | string   | No       | `"medium"` |
| `status`      | string   | No       | `"todo"`   |
| `dueDate`     | string   | Yes      | —          |
| `tags`        | string[] | No       | `[]`       |
| `assignedTo`  | string   | No       | `""`       |

**Response:** `201` — created `Task`

### `GET /api/tasks/:id`

Returns a single task by ID.

**Response:** `200` — `Task` | `404`

### `PUT /api/tasks/:id`

Update a task. Accepts any partial `Task` fields in the request body.

**Response:** `200` — updated `Task` | `404`

### `DELETE /api/tasks/:id`

Delete a task by ID.

**Response:** `200` — `{ message: "Task deleted" }` | `404`

---

## Pages & Routes

| Route             | Type   | Description                              |
| ----------------- | ------ | ---------------------------------------- |
| `/`               | Client | Dashboard with stats and recent tasks    |
| `/tasks`          | Server | Paginated task list with sidebar filters |
| `/tasks/:id`      | Server | Task detail view                         |
| `/tasks/:id/edit` | Client | Edit task form                           |
| `/create`         | Client | Create task form                         |

---

## State Management

The app uses **Redux Toolkit** for global state:

- **Store** — configured in `store/index.ts` with a single `tasks` slice.
- **Provider** — `store/provider.tsx` wraps the app in a client-side `<Provider>`.
- **Async Thunks** — `fetchTasks`, `createTask`, `editTask`, `removeTask` handle API calls.
- **Synchronous Reducers** — `setTasks`, `addTask`, `updateTask`, `deleteTask`, `setFilters`, `clearFilters`, `setSelectedTask`.

### Task State Shape

```ts
interface TaskState {
  tasks: Task[];
  filters: TaskFilters; // { status, priority, search }
  selectedTask: Task | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}
```

---

## Custom Hooks

| Hook             | Purpose                                                                 |
| ---------------- | ----------------------------------------------------------------------- |
| `useTaskForm`    | Manages form values, validation (title & due date required), and reset. |
| `useTaskFilters` | Derives filtered tasks from Redux store using memoised selectors.       |
| `usePagination`  | Generic pagination logic — page navigation, clamping, and slicing.      |

---

## Components

| Component         | Description                                                               |
| ----------------- | ------------------------------------------------------------------------- |
| `Navbar`          | Sticky top bar with navigation links, theme toggle, and mobile hamburger. |
| `TaskCard`        | Card displaying status, priority, tags, due date, and action buttons.     |
| `TaskDetailView`  | Full detail page with edit/delete actions and overdue indicator.          |
| `TaskList`        | Paginated grid of `TaskCard` components with delete confirmation.         |
| `TaskFiltersBar`  | Search input + status/priority dropdowns with clear button.               |
| `TaskStatusBadge` | Coloured, sized badge for `todo` / `in-progress` / `done`.                |
| `ConfirmDialog`   | Radix-based modal for confirming destructive actions.                     |
| `LoadingSpinner`  | Accessible spinner in `sm`, `md`, `lg` sizes with optional label.         |

---

## Theming

Theme is managed via `context/ThemeContext.tsx`:

- **Dark / Light mode** — toggled from the navbar; preference saved in `localStorage`.
- **Sidebar visibility** — collapsible sidebar with mobile overlay.
- **Compact view** — toggleable compact card layout.

The `<html>` element receives the `dark` class and `data-theme` attribute, integrating with Tailwind's dark-mode utilities.

---

## Task Model

```ts
interface Task {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in-progress" | "done";
  dueDate: string;
  createdAt: string;
  tags: string[];
  assignedTo: string;
}
```

---

## License

This project is for learning and practice purposes.
