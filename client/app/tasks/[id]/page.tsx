"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import TaskDetailView from "@/components/TaskDetailView";
import { AppDispatch, RootState } from "@/store";
import { fetchTaskById } from "@/store/taskListSlice";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function TaskDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const dispatch = useDispatch<AppDispatch>();
  const { selectedTask } = useSelector((state: RootState) => state.taskList);

  useEffect(() => {
    if (id) dispatch(fetchTaskById(id));
  }, [id, dispatch]);

  if (!selectedTask || selectedTask._id !== id) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" label="Loading task..." />
      </div>
    );
  }

  return <TaskDetailView task={selectedTask} />;
}
