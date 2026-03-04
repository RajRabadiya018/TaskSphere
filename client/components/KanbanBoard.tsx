"use client";

import { AppDispatch, RootState } from "@/store";
import {
  moveTaskLocal,
  reorderColumns,
  reorderColumnsLocal,
  reorderTasks,
  toggleStar,
} from "@/store/taskSlice";
import { Column } from "@/types/column";
import { Task } from "@/types/task";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useCallback, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import KanbanColumn from "./KanbanColumn";
import KanbanTaskCard from "./KanbanTaskCard";

interface KanbanBoardProps {
  onAddTask: (columnId: string) => void;
  onOpenTask: (task: Task) => void;
  searchQuery?: string;
}

export default function KanbanBoard({
  onAddTask,
  onOpenTask,
  searchQuery = "",
}: KanbanBoardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { columns, tasks } = useSelector((state: RootState) => state.board);

  // Track the currently dragged item (task or column) and its source column
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [dragSourceColId, setDragSourceColId] = useState<string | null>(null);

  // Prevents drag oscillation: when a task crosses column boundaries, dnd-kit
  // can fire both A→B and B→A moves in rapid succession. This ref blocks the reversal.
  const lastCrossColMoveRef = useRef<{ from: string; to: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );


  const sortedColumns = useMemo(
    () => [...columns].sort((a, b) => a.position - b.position),
    [columns],
  );

  const columnIds = useMemo(
    () => sortedColumns.map((c) => c._id),
    [sortedColumns],
  );

  // Returns tasks for a column, filtered by search query and sorted (starred first, then by position)
  const getSortedTasks = useCallback(
    (columnId: string): Task[] => {
      let colTasks = tasks[columnId] || [];

      // Filter by search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        colTasks = colTasks.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
            (t.assignedTo && t.assignedTo.toLowerCase().includes(q)),
        );
      }

      const sorted = [...colTasks].sort((a, b) => {
        // Starred always first
        if (a.starred !== b.starred) return a.starred ? -1 : 1;
        return a.position - b.position;
      });
      return sorted;
    },
    [tasks, searchQuery],
  );

  const handleStar = (taskId: string) => {
    for (const colId of Object.keys(tasks)) {
      const task = tasks[colId]?.find((t) => t._id === taskId);
      if (task) {
        dispatch(toggleStar({ id: taskId, columnId: colId }));
        break;
      }
    }
  };

  // Find which column a task belongs to
  const findColumnOfTask = (taskId: string): string | null => {
    for (const colId of Object.keys(tasks)) {
      if (tasks[colId]?.some((t) => t._id === taskId)) {
        return colId;
      }
    }
    return null;
  };

  // Identifies what is being dragged (column vs task) and stores it in state
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = active.id as string;
    lastCrossColMoveRef.current = null;

    if (active.data.current?.type === "column") {
      const col = columns.find((c) => c._id === id);
      if (col) setActiveColumn(col);
      return;
    }

    const colId = findColumnOfTask(id);
    if (colId) {
      const task = tasks[colId]?.find((t) => t._id === id);
      if (task) {
        setActiveTask(task);
        setDragSourceColId(colId);
      }
    }
  };

  // Fires continuously while dragging over elements — handles cross-column task moves
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !activeTask) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceColId = findColumnOfTask(activeId);
    if (!sourceColId) return;

    // Determine destination column: could be hovering over a column directly or over a task in a column
    let destColId: string | null = null;
    if (columns.some((c) => c._id === overId)) {
      destColId = overId;
    } else {
      destColId = findColumnOfTask(overId);
    }

    if (!destColId || sourceColId === destColId) return;

    // Prevent oscillation: block immediate reversal of a cross-column move
    const lastMove = lastCrossColMoveRef.current;
    if (
      lastMove &&
      lastMove.to === sourceColId &&
      lastMove.from === destColId
    ) {
      return;
    }
    lastCrossColMoveRef.current = { from: sourceColId, to: destColId };

    // Optimistic move: update UI immediately; API call happens in handleDragEnd
    const destTasks = tasks[destColId] || [];
    const overTaskIndex = destTasks.findIndex((t) => t._id === overId);
    const destIndex = overTaskIndex >= 0 ? overTaskIndex : destTasks.length;

    dispatch(
      moveTaskLocal({
        taskId: activeId,
        sourceColId,
        destColId,
        destIndex,
      }),
    );
  };

  // Fires when the user releases the dragged item — persists changes to the server
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Handle column reorder drop
    if (activeColumn) {
      setActiveColumn(null);
      if (!over || active.id === over.id) return;

      const oldIndex = sortedColumns.findIndex(
        (c) => c._id === (active.id as string),
      );
      const newIndex = sortedColumns.findIndex(
        (c) => c._id === (over.id as string),
      );
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      dispatch(
        reorderColumnsLocal({
          activeId: active.id as string,
          overId: over.id as string,
        }),
      );

      // Persist column order to the server
      const reordered = [...sortedColumns];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);
      dispatch(
        reorderColumns(reordered.map((c, i) => ({ id: c._id, position: i }))),
      );
      return;
    }

    // Handle task drop
    if (activeTask) {
      setActiveTask(null);
      lastCrossColMoveRef.current = null;
      if (!over) {
        setDragSourceColId(null);
        return;
      }

      const overId = over.id as string;
      const activeId = active.id as string;

      // Use the tracked original source column (before handleDragOver moved it)
      const originalSourceColId = dragSourceColId;
      setDragSourceColId(null);

      const currentColId = findColumnOfTask(activeId);
      if (!currentColId) return;

      let destColId: string | null = null;
      if (columns.some((c) => c._id === overId)) {
        destColId = overId;
      } else {
        destColId = findColumnOfTask(overId);
      }
      if (!destColId) destColId = currentColId;

      // Cross-column move (fallback if handleDragOver's guard prevented it)
      if (currentColId !== destColId) {
        const destTasks = tasks[destColId] || [];
        const overTaskIndex = destTasks.findIndex((t) => t._id === overId);
        const destIndex = overTaskIndex >= 0 ? overTaskIndex : destTasks.length;
        dispatch(
          moveTaskLocal({
            taskId: activeId,
            sourceColId: currentColId,
            destColId,
            destIndex,
          }),
        );
      } else if (activeId !== overId) {
        // Reorder within same column
        const colTasks = tasks[destColId] || [];
        const oldIndex = colTasks.findIndex((t) => t._id === activeId);
        const newIndex = colTasks.findIndex((t) => t._id === overId);

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          dispatch(
            moveTaskLocal({
              taskId: activeId,
              sourceColId: currentColId,
              destColId,
              destIndex: newIndex,
            }),
          );
        }
      }

      // Persist updated positions for all tasks in affected columns (source + destination)
      const affectedCols = new Set([destColId]);
      if (originalSourceColId) affectedCols.add(originalSourceColId);
      if (currentColId) affectedCols.add(currentColId);

      const bulkUpdates: {
        id: string;
        position: number;
        columnId: string;
      }[] = [];
      affectedCols.forEach((colId) => {
        (tasks[colId] || []).forEach((t, i) => {
          bulkUpdates.push({
            id: t._id,
            position: i,
            columnId: colId,
          });
        });
      });

      if (bulkUpdates.length > 0) {
        dispatch(reorderTasks(bulkUpdates));
      }
      return;
    }

    setActiveTask(null);
    setActiveColumn(null);
    setDragSourceColId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={columnIds}
        strategy={horizontalListSortingStrategy}
      >
        <div className="flex h-full gap-4 overflow-x-auto pb-2 scrollbar-none">
          {sortedColumns.map((column) => (
            <KanbanColumn
              key={column._id}
              column={column}
              tasks={getSortedTasks(column._id)}
              onAddTask={onAddTask}
              onOpenTask={onOpenTask}
              onStarTask={handleStar}
            />
          ))}
        </div>
      </SortableContext>

      {/* Drag overlay: floating preview that follows the cursor during drag */}
      <DragOverlay>
        {activeTask && (
          <div className="rotate-3 opacity-90">
            <KanbanTaskCard
              task={activeTask}
              onOpen={() => { }}
              onStar={() => { }}
              isDragOverlay
            />
          </div>
        )}
        {activeColumn && (
          <div className="w-70 rounded-xl bg-muted/80 border border-border/50 p-4 opacity-80 rotate-2">
            <h3 className="text-sm font-semibold text-foreground">
              {activeColumn.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {(tasks[activeColumn._id] || []).length} tasks
            </p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
