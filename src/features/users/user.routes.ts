import { Router } from "express";
import {
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe,
    getMe,
} from "./user.controller";
import { protect, restrictTo } from "../../middleware/auth.middleware";

// We can also mount auth routes here or keep them separate in app.ts.
// The user pattern says "Features include ... routes".
// So usually separate.

const router = Router();

// Protect all routes after this middleware
router.use(protect);

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
router.get("/me", getMe, getUser);
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
router.patch("/updateMe", updateMe);
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
router.delete("/deleteMe", deleteMe);

// Restrict to admin after this middleware
router.use(restrictTo("admin"));

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
router.route("/").get(getAllUsers).post(createUser);

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
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

export default router;
