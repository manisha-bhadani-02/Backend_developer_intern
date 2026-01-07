import { Router } from "express";
import {
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    verifyPassword,
    verifyEmail,
} from "./auth.controller";
import { protect, restrictTo } from "../../middleware/auth.middleware";
import { authLimiter } from "../../middleware/rateLimit.middleware";

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */
router.post("/register", register);
router.post("/login", authLimiter, login);

/**
 * @swagger
 * /auth/verifyEmail/{token}:
 *   get:
 *     summary: Verify user email address
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified successfully, user logged in
 *       400:
 *         description: Invalid or expired token
 */
router.get("/verifyEmail/:token", verifyEmail);
/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Log out current user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User logged out successfully
 */
router.get("/logout", logout);

/**
 * @swagger
 * /auth/forgotPassword:
 *   post:
 *     summary: Request password reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token sent to email
 *       404:
 *         description: User not found
 */
router.post("/forgotPassword", forgotPassword);
/**
 * @swagger
 * /auth/resetPassword/{token}:
 *   patch:
 *     summary: Reset password using token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Reset token received in email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired token
 */
router.patch("/resetPassword/:token", resetPassword);

// Dashboard Lock / Unlock verification
/**
 * @swagger
 * /auth/verify-password:
 *   post:
 *     summary: Verify password for sensitive actions (Lock Screen)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password verified
 *       401:
 *         description: Incorrect password
 */
router.post("/verify-password", protect, verifyPassword);

export default router;
