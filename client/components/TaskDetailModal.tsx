"use client";

import ConfirmDialog from "@/components/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AppDispatch } from "@/store";
import { editTask, removeTask } from "@/store/taskSlice";
import { Task } from "@/types/task";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

interface TaskDetailModalProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}

const priorityStyles: Record<string, string> = {
  low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  high: "bg-red-500/20 text-red-400 border-red-500/30",
};

function formatDateForInput(dateString?: string): string {
  if (!dateString) return "";
  return new Date(dateString).toISOString().split("T")[0];
}

export default function TaskDetailModal({
  open,
  onClose,
  task,
}: TaskDetailModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setDueDate(formatDateForInput(task.dueDate));
      setTagsInput(task.tags.join(", "));
      setAssignedTo(task.assignedTo || "");
      setEditing(false);
    }
  }, [task]);

  const handleSave = async () => {
    if (!task || !title.trim()) return;
    setSaving(true);
    setModalError(null);
    try {
      await dispatch(
        editTask({
          id: task._id,
          updates: {
            title: title.trim(),
            description: description.trim(),
            priority,
            dueDate: dueDate || undefined,
            tags: tagsInput
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
            assignedTo: assignedTo.trim(),
          },
        }),
      ).unwrap();
      setEditing(false);
    } catch (err: unknown) {
      setModalError(
        typeof err === "string"
          ? err
          : "Failed to save changes. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    try {
      await dispatch(
        removeTask({ id: task._id, columnId: task.columnId }),
      ).unwrap();
      setDeleteConfirm(false);
      onClose();
    } catch (err: unknown) {
      setModalError(
        typeof err === "string"
          ? err
          : "Failed to delete task. Please try again.",
      );
      setDeleteConfirm(false);
    }
  };

  if (!task) return null;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setEditing(false);
            setModalError(null);
            onClose();
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-8">
              {editing ? "Edit Task" : "Task Details"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Task details and editing form
            </DialogDescription>
          </DialogHeader>

          {editing ? (
            <div className="space-y-4">
              {modalError && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {modalError}
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Title <span className="text-destructive">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  autoFocus
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none resize-none dark:bg-input/30"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Priority
                  </label>
                  <select
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30"
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as "low" | "medium" | "high")
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Tags
                  </label>
                  <Input
                    placeholder="design, frontend"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Comma-separated
                  </p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Assigned To
                  </label>
                  <Input
                    placeholder="Name"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!title.trim() || saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <div className="mb-2.5 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${priorityStyles[task.priority]}`}
                  >
                    {task.priority.charAt(0).toUpperCase() +
                      task.priority.slice(1)}{" "}
                    Priority
                  </span>
                  {task.starred && (
                    <svg
                      className="h-4 w-4 text-yellow-500"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  )}
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  {task.title}
                </h2>
              </div>

              {task.description && (
                <div>
                  <h4 className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Description
                  </h4>
                  <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
                    {task.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4">
                {task.dueDate && (
                  <div>
                    <h4 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Due Date
                    </h4>
                    <p className="mt-0.5 text-sm font-medium text-foreground">
                      {new Date(task.dueDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                )}
                {task.assignedTo && (
                  <div>
                    <h4 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Assigned To
                    </h4>
                    <p className="mt-0.5 text-sm font-medium text-foreground">
                      {task.assignedTo}
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Created
                  </h4>
                  <p className="mt-0.5 text-sm font-medium text-foreground">
                    {new Date(task.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {task.tags.length > 0 && (
                <div>
                  <h4 className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {task.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(true)}
                  className="flex-1"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive hover:text-white"
                  onClick={() => setDeleteConfirm(true)}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm}
        title="Delete Task"
        description={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(false)}
        confirmLabel="Delete"
        destructive
      />
    </>
  );
}
