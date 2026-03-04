import crypto from "crypto";
import mongoose, { Document, Schema } from "mongoose";

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  columnId: mongoose.Types.ObjectId;
  columnName: string;
  dashboardId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  tags: string[];
  assignedTo: string;
  assigneeId: string;
  position: number;
  starred: boolean;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    columnId: {
      type: Schema.Types.ObjectId,
      ref: "Column", // References the Column model for population
      required: [true, "Column ID is required"],
      index: true,
    },
    columnName: {
      type: String,
      default: "",
    },
    dashboardId: {
      type: Schema.Types.ObjectId,
      ref: "Dashboard",
      required: [true, "Dashboard ID is required"],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Task title must be at most 200 characters"],
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: {
      type: Date,
      default: undefined,
    },
    tags: {
      type: [String],
      default: [],
    },
    assignedTo: {
      type: String,
      default: "",
      trim: true,
    },
    assigneeId: {
      type: String,
      sparse: true,
      default: undefined,
    },
    position: {
      type: Number,
      required: true,
      default: 0,
    },
    starred: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Pre-save hook: auto-generate a consistent assigneeId for each unique assignee name.
// If another task already has this assignee name, reuse that ID for consistency.
// Otherwise, generate a new random ID like "ASN-A1B2C3D4".
taskSchema.pre("save", async function (next) {
  try {
    if (this.assignedTo && this.assignedTo.trim()) {
      if (!this.assigneeId) {
        // Check if any existing task already has an ID for this assignee name
        const existing = await mongoose
          .model("Task")
          .findOne({
            assignedTo: this.assignedTo.trim(),
            assigneeId: { $ne: null },
          })
          .select("assigneeId")
          .lean();
        this.assigneeId = existing
          ? (existing as any).assigneeId
          : `ASN-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
      }
    } else {
      this.assigneeId = undefined as any;
    }
    next();
  } catch (err: any) {
    next(err);
  }
});

// Compound indexes for efficient queries when fetching tasks by column or dashboard
taskSchema.index({ columnId: 1, position: 1 });
taskSchema.index({ dashboardId: 1, columnId: 1 });

const Task = mongoose.model<ITask>("Task", taskSchema);
export default Task;
