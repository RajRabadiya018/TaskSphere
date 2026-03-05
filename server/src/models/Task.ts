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
  position: number;
  starred: boolean;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    columnId: {
      type: Schema.Types.ObjectId,
      ref: "Column",
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

taskSchema.index({ columnId: 1, position: 1 });
taskSchema.index({ dashboardId: 1, columnId: 1 });

const Task = mongoose.model<ITask>("Task", taskSchema);
export default Task;
