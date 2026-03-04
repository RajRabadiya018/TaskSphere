"use client";

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
import { createTask } from "@/store/taskSlice";
import { useState } from "react";
import { useDispatch } from "react-redux";

interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
  columnId: string;
  dashboardId: string;
  columnName: string;
}

export default function AddTaskDialog({
  open,
  onClose,
  columnId,
  dashboardId,
  columnName,
}: AddTaskDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
    setTagsInput("");
    setAssignedTo("");
    setFormError(null);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    setFormError(null);
    try {
      await dispatch(
        createTask({
          columnId,
          dashboardId,
          title: title.trim(),
          description: description.trim(),
          priority,
          dueDate: dueDate || undefined,
          tags: tagsInput
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          assignedTo: assignedTo.trim(),
        }),
      ).unwrap();
      resetForm();
      onClose();
    } catch (err: unknown) {
      setFormError(
        typeof err === "string"
          ? err
          : "Failed to create task. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
          <DialogDescription>
            Adding to <strong>{columnName}</strong> column
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error banner */}
          {formError && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && title.trim()) handleSubmit();
              }}
              maxLength={200}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Description
            </label>
            <textarea
              className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none resize-none dark:bg-input/30"
              placeholder="Optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Priority + Due Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
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
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Due Date
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Tags + Assigned row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
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
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Assigned To
              </label>
              <Input
                placeholder="Name"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => {
              resetForm();
              onClose();
            }}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || submitting}>
            {submitting ? "Creating…" : "Add Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
