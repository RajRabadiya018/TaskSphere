export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  _id: string;
  columnId: string;
  columnName?: string;
  dashboardId: string;
  userId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate?: string;
  tags: string[];
  assignedTo: string;

  position: number;
  starred: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Populated version returned by GET /api/tasks and GET /api/tasks/:id */
export interface TaskListItem {
  _id: string;
  columnId: { _id: string; name: string; type: string };
  dashboardId: { _id: string; name: string };
  userId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate?: string;
  tags: string[];
  assignedTo: string;

  position: number;
  starred: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Stats returned by GET /api/tasks/stats */
export interface TaskStats {
  total: number;
  overdue: number;
  byColumn: Record<string, number>;
}
