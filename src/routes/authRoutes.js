import express from 'express';
import { register, login, getProfile } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validateBody, registerSchema, loginSchema } from '../middlewares/validationMiddleware.js';

const router = express.Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: testuser
 *               email:
 *                 type: string
 *                 example: test@academia.com
 *               password:
 *                 type: string
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [admin, staff]
 *                 example: staff
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or duplicate username/email
 */
router.post('/register', validateBody(registerSchema), register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user and get JWT token
 *     tags: [Authentication]
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
 *                 example: admin@academia.com
 *               password:
 *                 type: string
 *                 example: adminpassword
 *     responses:
 *       200:
 *         description: Logged in successfully
 *       401:
 *         description: Incorrect email or password
 */
router.post('/login', validateBody(loginSchema), login);

/**
 * @openapi
 * /api/auth/profile:
 *   get:
 *     summary: Get profile of logged-in user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile details retrieved
 *       401:
 *         description: Unauthorized - invalid/expired token
 */
router.get('/profile', protect, getProfile);

export default router;
