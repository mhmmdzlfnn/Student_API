import pool from '../config/db.js';

// Get all courses
export const getAllCourses = async (req, res, next) => {
  try {
    const { rows: courses } = await pool.query('SELECT * FROM courses ORDER BY code ASC');
    res.status(200).json({
      status: 'success',
      data: {
        courses
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get course by ID
export const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows: courses } = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
    
    if (courses.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Course not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        course: courses[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create new course
export const createCourse = async (req, res, next) => {
  try {
    const { code, name, credits } = req.body;

    // Check if course code already exists
    const { rows: existingCode } = await pool.query('SELECT id FROM courses WHERE code = $1', [code]);
    if (existingCode.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Course code already exists'
      });
    }

    const { rows } = await pool.query(
      'INSERT INTO courses (code, name, credits) VALUES ($1, $2, $3) RETURNING id',
      [code, name, credits]
    );

    res.status(201).json({
      status: 'success',
      message: 'Course created successfully',
      data: {
        id: rows[0].id,
        code,
        name,
        credits
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update course
export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, name, credits } = req.body;

    const { rows: courses } = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
    if (courses.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Course not found'
      });
    }

    const currentCourse = courses[0];

    // Check course code duplicate if code is being changed
    if (code && code !== currentCourse.code) {
      const { rows: existingCode } = await pool.query('SELECT id FROM courses WHERE code = $1', [code]);
      if (existingCode.length > 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'Course code already exists'
        });
      }
    }

    const updatedCourse = {
      code: code !== undefined ? code : currentCourse.code,
      name: name !== undefined ? name : currentCourse.name,
      credits: credits !== undefined ? credits : currentCourse.credits
    };

    await pool.query(
      'UPDATE courses SET code = $1, name = $2, credits = $3 WHERE id = $4',
      [updatedCourse.code, updatedCourse.name, updatedCourse.credits, id]
    );

    res.status(200).json({
      status: 'success',
      message: 'Course updated successfully',
      data: {
        id: parseInt(id),
        ...updatedCourse
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete course
export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows: courses } = await pool.query('SELECT id FROM courses WHERE id = $1', [id]);
    if (courses.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Course not found'
      });
    }

    await pool.query('DELETE FROM courses WHERE id = $1', [id]);

    res.status(200).json({
      status: 'success',
      message: 'Course deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Enroll a student in a course
export const enrollStudent = async (req, res, next) => {
  try {
    const { student_id, course_id, enrollment_date, semester } = req.body;

    // 1. Verify student exists
    const { rows: students } = await pool.query('SELECT id FROM students WHERE id = $1', [student_id]);
    if (students.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Student not found'
      });
    }

    // 2. Verify course exists
    const { rows: courses } = await pool.query('SELECT id FROM courses WHERE id = $1', [course_id]);
    if (courses.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Course not found'
      });
    }

    // 3. Verify if student is already enrolled in this course
    const { rows: existingEnrollment } = await pool.query(
      'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [student_id, course_id]
    );
    if (existingEnrollment.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Student is already enrolled in this course'
      });
    }

    // 4. Perform insertion
    const { rows } = await pool.query(
      'INSERT INTO enrollments (student_id, course_id, enrollment_date, semester) VALUES ($1, $2, $3, $4) RETURNING id',
      [student_id, course_id, enrollment_date, semester]
    );

    res.status(201).json({
      status: 'success',
      message: 'Student enrolled in course successfully',
      data: {
        id: rows[0].id,
        student_id,
        course_id,
        enrollment_date,
        semester
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all courses taken by a specific student (JOIN Query)
export const getStudentCourses = async (req, res, next) => {
  try {
    const { id } = req.params; // student_id

    // Check if student exists
    const { rows: students } = await pool.query('SELECT id, name, nim FROM students WHERE id = $1', [id]);
    if (students.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Student not found'
      });
    }

    const student = students[0];

    // JOIN Query between courses and enrollments
    const query = `
      SELECT c.id, c.code, c.name, c.credits, e.enrollment_date, e.semester, e.id AS enrollment_id
      FROM courses c
      INNER JOIN enrollments e ON c.id = e.course_id
      WHERE e.student_id = $1
      ORDER BY e.enrollment_date DESC
    `;

    const { rows: courses } = await pool.query(query, [id]);

    res.status(200).json({
      status: 'success',
      data: {
        student,
        courses
      }
    });
  } catch (error) {
    next(error);
  }
};
