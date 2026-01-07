import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
    title: string;
    description: string;
    status: "pending" | "in-progress" | "completed";
    user: mongoose.Types.ObjectId;
}

const taskSchema = new Schema<ITask>(
    {
        title: { type: String, required: true },
        description: { type: String },
        status: {
            type: String,
            enum: ["pending", "in-progress", "completed"],
            default: "pending",
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

const Task = mongoose.model<ITask>("Task", taskSchema);
export default Task;
