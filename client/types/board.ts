import { Column } from "./column";
import { Dashboard } from "./dashboard";
import { Task } from "./task";

export interface BoardData {
    dashboard: Dashboard;
    columns: Column[];
    tasks: Record<string, Task[]>; // columnId → Task[]
}
