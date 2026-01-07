import { Request, Response, NextFunction } from "express";
import Product from "./product.model";
import * as factory from "../../utils/handlerFactory";
import { catchAsync } from "../../utils/catchAsync";
import { HTTP_STATUS } from "../../constants/http";

export const getAllProducts = factory.getAll(Product);
export const getProduct = factory.getOne(Product);
export const updateProduct = factory.updateOne(Product);
export const deleteProduct = factory.deleteOne(Product);

export const createProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.createdBy) req.body.createdBy = req.user!._id;
    const newProduct = await Product.create(req.body);

    res.status(HTTP_STATUS.CREATED).json({
        status: "success",
        data: { data: newProduct },
    });
});
