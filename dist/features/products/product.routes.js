"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("./product.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products (Public)
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 *   post:
 *     summary: Create a new product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created
 */
router.route("/").get(product_controller_1.getAllProducts).post(auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)("admin"), product_controller_1.createProduct);
/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product data
 *   patch:
 *     summary: Update a product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product updated
 *   delete:
 *     summary: Delete a product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Product deleted
 */
router
    .route("/:id")
    .get(product_controller_1.getProduct)
    .patch(auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)("admin"), product_controller_1.updateProduct)
    .delete(auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)("admin"), product_controller_1.deleteProduct);
exports.default = router;
