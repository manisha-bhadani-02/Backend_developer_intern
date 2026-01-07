import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    createdBy: mongoose.Types.ObjectId;
}

const productSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        stock: { type: Number, default: 0 },
        category: { type: String },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

const Product = mongoose.model<IProduct>("Product", productSchema);
export default Product;
