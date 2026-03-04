import mongoose, { Document, Schema } from "mongoose";

export interface IDashboard extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const dashboardSchema = new Schema<IDashboard>(
    {
        name: {
            type: String,
            required: [true, "Dashboard name is required"],
            trim: true,
            minlength: [1, "Dashboard name must be at least 1 character"],
            maxlength: [50, "Dashboard name must be at most 50 characters"],
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index: speeds up listing dashboards for a specific user sorted by creation date
dashboardSchema.index({ userId: 1, createdAt: -1 });

const Dashboard = mongoose.model<IDashboard>("Dashboard", dashboardSchema);
export default Dashboard;
