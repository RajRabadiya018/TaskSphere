import { Task, TaskListItem } from "@/types/task";
import { useCallback, useMemo, useState } from "react";

interface FormValues {
  title: string;
  description: string;
  priority: Task["priority"];
  dueDate: string;
  tags: string;
  assignedTo: string;
}

interface FormErrors {
  title?: string;
  dueDate?: string;
}

interface UseTaskFormReturn {
  values: FormValues;
  handleChange: (field: keyof FormValues, value: string) => void;
  handleSubmit: (onSubmit: (values: FormValues) => void) => void;
  errors: FormErrors;
  reset: () => void;
}

const defaultValues: FormValues = {
  title: "",
  description: "",
  priority: "medium",
  dueDate: "",
  tags: "",
  assignedTo: "",
};

export function useTaskForm(
  initialValues?: Partial<Task> | Partial<TaskListItem>,
): UseTaskFormReturn {
  const startingValues: FormValues = useMemo(
    () => ({
      ...defaultValues,
      ...(initialValues
        ? {
            title: initialValues.title || "",
            description: initialValues.description || "",
            priority: initialValues.priority || "medium",
            dueDate: initialValues.dueDate
              ? initialValues.dueDate.slice(0, 10)
              : "",
            tags: initialValues.tags?.join(", ") || "",
            assignedTo: initialValues.assignedTo || "",
          }
        : {}),
    }),
    [initialValues],
  );

  const [values, setValues] = useState<FormValues>(startingValues);
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = useCallback((field: keyof FormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const handleSubmit = useCallback(
    (onSubmit: (values: FormValues) => void) => {
      const newErrors: FormErrors = {};

      if (!values.title.trim()) {
        newErrors.title = "Title is required";
      }

      if (!values.dueDate || isNaN(Date.parse(values.dueDate))) {
        newErrors.dueDate = "A valid due date is required";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setErrors({});
      onSubmit(values);
    },
    [values],
  );

  const reset = useCallback(() => {
    setValues(startingValues);
    setErrors({});
  }, [startingValues]);

  return {
    values,
    handleChange,
    handleSubmit,
    errors,
    reset,
  };
}
