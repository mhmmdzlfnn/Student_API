import express from 'express';
import { 
  getAllStudents, 
  getStudentById, 
  createStudent, 
  updateStudent, 
  deleteStudent 
} from '../controllers/studentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrictTo } from '../middlewares/roleMiddleware.js';
import { validateBody, studentSchema, studentUpdateSchema } from '../middlewares/validationMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @openapi
 * /api/students:
 *   get:
 *     summary: Retrieve list of students (Supports search, pagination, and sorting)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword matching name, NIM, or major
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [nim, name, email, major, created_at]
 *           default: name
 *         description: Database column to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: A paginated list of students
 *       401:
 *         description: Unauthorized
 */
router.get('/', getAllStudents);

/**
 * @openapi
 * /api/students/{id}:
 *   get:
 *     summary: Get details of a single student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the student
 *     responses:
 *       200:
 *         description: Student details retrieved
 *       404:
 *         description: Student not found
 */
router.get('/:id', getStudentById);

/**
 * @openapi
 * /api/students:
 *   post:
 *     summary: Create a new student (Admin Only)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nim
 *               - name
 *               - email
 *               - major
 *             properties:
 *               nim:
 *                 type: string
 *                 example: "10112004"
 *               name:
 *                 type: string
 *                 example: "Jane Doe"
 *               email:
 *                 type: string
 *                 example: "jane@example.com"
 *               phone:
 *                 type: string
 *                 example: "081234567890"
 *               major:
 *                 type: string
 *                 example: "Informatics"
 *     responses:
 *       201:
 *         description: Student created successfully
 *       400:
 *         description: Duplicate NIM/Email or validation error
 *       403:
 *         description: Forbidden - Admin permission required
 */
router.post('/', restrictTo('admin'), validateBody(studentSchema), createStudent);

/**
 * @openapi
 * /api/students/{id}:
 *   put:
 *     summary: Update an existing student's info (Admin Only)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the student
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nim:
 *                 type: string
 *                 example: "10112004"
 *               name:
 *                 type: string
 *                 example: "Jane Smith"
 *               email:
 *                 type: string
 *                 example: "jane.smith@example.com"
 *               phone:
 *                 type: string
 *                 example: "081234567891"
 *               major:
 *                 type: string
 *                 example: "Computer Science"
 *     responses:
 *       200:
 *         description: Student updated successfully
 *       400:
 *         description: Duplicate NIM/Email or validation error
 *       403:
 *         description: Forbidden - Admin permission required
 *       404:
 *         description: Student not found
 */
router.put('/:id', restrictTo('admin'), validateBody(studentUpdateSchema), updateStudent);

/**
 * @openapi
 * /api/students/{id}:
 *   delete:
 *     summary: Delete a student (Admin Only)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the student to delete
 *     responses:
 *       200:
 *         description: Student deleted successfully
 *       403:
 *         description: Forbidden - Admin permission required
 *       404:
 *         description: Student not found
 */
router.delete('/:id', restrictTo('admin'), deleteStudent);

export default router;
