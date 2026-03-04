import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import dashboardReducer from "./dashboardSlice";
import taskListReducer from "./taskListSlice";
import boardReducer from "./taskSlice";

// Redux store with 4 slices:
// - auth: handles JWT authentication state (login, signup, token hydration)
// - dashboards: manages the list of user dashboards
// - board: Kanban board state (columns + tasks grouped by column, drag-and-drop)
// - taskList: flat task list view with filters, stats, and selected task
export const store = configureStore({
  reducer: {
    board: boardReducer,
    taskList: taskListReducer,
    auth: authReducer,
    dashboards: dashboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
