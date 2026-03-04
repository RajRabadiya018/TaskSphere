import mongoose, { Document, Schema } from "mongoose";

export interface IColumn extends Document {
    _id: mongoose.Types.ObjectId;
    dashboardId: mongoose.Types.ObjectId;
    name: string;
    type: "default" | "custom"; 
    position: number;
    createdAt: Date;
    updatedAt: Date;
}

const columnSchema = new Schema<IColumn>(
    {
        dashboardId: {
            type: Schema.Types.ObjectId,
            ref: "Dashboard",
            required: [true, "Dashboard ID is required"],
            index: true,
        },
        name: {
            type: String,
            required: [true, "Column name is required"],
            trim: true,
            maxlength: [50, "Column name must be at most 50 characters"],
        },
        type: {
            type: String,
            enum: ["default", "custom"],
            default: "custom",
        },
        position: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

columnSchema.index({ dashboardId: 1, position: 1 });

const Column = mongoose.model<IColumn>("Column", columnSchema);
export default Column;
