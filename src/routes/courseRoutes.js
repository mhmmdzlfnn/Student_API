import express from 'express';
import { 
  getAllCourses, 
  getCourseById, 
  createCourse, 
  updateCourse, 
  deleteCourse, 
  enrollStudent,
  getStudentCourses
} from '../controllers/courseController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { restrictTo } from '../middlewares/roleMiddleware.js';
import { validateBody, courseSchema, enrollmentSchema } from '../middlewares/validationMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @openapi
 * /api/courses:
 *   get:
 *     summary: Retrieve list of all courses
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of courses retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/', getAllCourses);

/**
 * @openapi
 * /api/courses/{id}:
 *   get:
 *     summary: Get details of a single course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the course
 *     responses:
 *       200:
 *         description: Course details retrieved
 *       404:
 *         description: Course not found
 */
router.get('/:id', getCourseById);

/**
 * @openapi
 * /api/courses/student/{id}:
 *   get:
 *     summary: Retrieve list of courses taken by a specific student (JOIN Query)
 *     tags: [Courses]
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
 *         description: List of courses matching the student
 *       404:
 *         description: Student not found
 */
router.get('/student/:id', getStudentCourses);

/**
 * @openapi
 * /api/courses:
 *   post:
 *     summary: Create a new course (Admin Only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - credits
 *             properties:
 *               code:
 *                 type: string
 *                 example: "IF-202"
 *               name:
 *                 type: string
 *                 example: "Web Programming"
 *               credits:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       201:
 *         description: Course created successfully
 *       400:
 *         description: Course code duplicate or validation error
 *       403:
 *         description: Forbidden - Admin permission required
 */
router.post('/', restrictTo('admin'), validateBody(courseSchema), createCourse);

/**
 * @openapi
 * /api/courses/{id}:
 *   put:
 *     summary: Update an existing course (Admin Only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the course to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: "IF-202"
 *               name:
 *                 type: string
 *                 example: "Advanced Web Programming"
 *               credits:
 *                 type: integer
 *                 example: 4
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       400:
 *         description: Validation error or duplicate course code
 *       403:
 *         description: Forbidden - Admin permission required
 *       404:
 *         description: Course not found
 */
router.put('/:id', restrictTo('admin'), updateCourse);

/**
 * @openapi
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete a course (Admin Only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the course to delete
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *       403:
 *         description: Forbidden - Admin permission required
 *       404:
 *         description: Course not found
 */
router.delete('/:id', restrictTo('admin'), deleteCourse);

/**
 * @openapi
 * /api/courses/enroll:
 *   post:
 *     summary: Enroll a student into a course (Admin Only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - student_id
 *               - course_id
 *               - enrollment_date
 *               - semester
 *             properties:
 *               student_id:
 *                 type: integer
 *                 example: 1
 *               course_id:
 *                 type: integer
 *                 example: 2
 *               enrollment_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-06-09"
 *               semester:
 *                 type: string
 *                 example: "Even 2025/2026"
 *     responses:
 *       201:
 *         description: Enrolled successfully
 *       400:
 *         description: Already enrolled or validation error
 *       403:
 *         description: Forbidden - Admin permission required
 *       404:
 *         description: Student or Course not found
 */
router.post('/enroll', restrictTo('admin'), validateBody(enrollmentSchema), enrollStudent);

export default router;
