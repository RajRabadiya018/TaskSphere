import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import dashboardReducer from "./dashboardSlice";
import taskListReducer from "./taskListSlice";
import boardReducer from "./taskSlice";

// store 
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
