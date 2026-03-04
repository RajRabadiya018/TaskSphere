export interface Column {
    _id: string;
    dashboardId: string;
    name: string;
    type: "default" | "custom";
    position: number;
    createdAt: string;
    updatedAt: string;
}
