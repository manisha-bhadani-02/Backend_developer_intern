"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
// We can also mount auth routes here or keep them separate in app.ts.
// The user pattern says "Features include ... routes".
// So usually separate.
const router = (0, express_1.Router)();
// Protect all routes after this middleware
router.use(auth_middleware_1.protect);
/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current logged in user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 */
router.get("/me", user_controller_1.getMe, user_controller_1.getUser);
/**
 * @swagger
 * /users/updateMe:
 *   patch:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               themePreference:
 *                 type: string
 *                 enum: [light, dark]
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.patch("/updateMe", user_controller_1.updateMe);
/**
 * @swagger
 * /users/deleteMe:
 *   delete:
 *     summary: Deactivate current user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deactivated (deleted)
 */
router.delete("/deleteMe", user_controller_1.deleteMe);
// Restrict to admin after this middleware
router.use((0, auth_middleware_1.restrictTo)("admin"));
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *   post:
 *     summary: Create a user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created
 */
router.route("/").get(user_controller_1.getAllUsers).post(user_controller_1.createUser);
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User data
 *   patch:
 *     summary: Update a user (Admin only)
 *     tags: [Users]
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
 *     responses:
 *       200:
 *         description: User updated
 *   delete:
 *     summary: Delete a user (Admin only)
 *     tags: [Users]
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
 *         description: User deleted
 */
router.route("/:id").get(user_controller_1.getUser).patch(user_controller_1.updateUser).delete(user_controller_1.deleteUser);
exports.default = router;
