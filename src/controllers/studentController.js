import pool from '../config/db.js';

export const getAllStudents = async (req, res, next) => {
  try {
    let { search, page = 1, limit = 10, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    let whereClause = '';
    let params = [];

    if (search) {
      whereClause = ' WHERE name ILIKE $1 OR nim ILIKE $2 OR major ILIKE $3';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    // 1. Get total count for pagination metadata
    const countQuery = `SELECT COUNT(*) AS total FROM students${whereClause}`;
    const { rows: countResult } = await pool.query(countQuery, params);
    const totalCount = parseInt(countResult[0].total);

    // 2. Fetch paginated data
    const offset = (page - 1) * limit;
    
    // Whitelist sorting fields to prevent SQL injection
    const allowedSortFields = ['nim', 'name', 'email', 'major', 'created_at'];
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const orderDir = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    const selectQuery = `
      SELECT id, nim, name, email, phone, major, created_at, updated_at 
      FROM students
      ${whereClause} 
      ORDER BY ${orderField} ${orderDir} 
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const { rows: students } = await pool.query(selectQuery, [...params, limit, offset]);
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      status: 'success',
      metadata: {
        page,
        limit,
        totalCount,
        totalPages
      },
      data: {
        students
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows: students } = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
    
    if (students.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Student not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        student: students[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createStudent = async (req, res, next) => {
  try {
    const { nim, name, email, phone, major } = req.body;

    // Check if NIM already exists
    const { rows: existingNim } = await pool.query('SELECT id FROM students WHERE nim = $1', [nim]);
    if (existingNim.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Student NIM is already registered'
      });
    }

    // Check if email already exists
    const { rows: existingEmail } = await pool.query('SELECT id FROM students WHERE email = $1', [email]);
    if (existingEmail.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Student Email is already registered'
      });
    }

    const { rows } = await pool.query(
      'INSERT INTO students (nim, name, email, phone, major) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [nim, name, email, phone || null, major]
    );

    res.status(201).json({
      status: 'success',
      message: 'Student created successfully',
      data: {
        id: rows[0].id,
        nim,
        name,
        email,
        phone,
        major
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nim, name, email, phone, major } = req.body;

    // Find if student exists
    const { rows: students } = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
    if (students.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Student not found'
      });
    }

    const currentStudent = students[0];

    // Check duplicate NIM if NIM is updated
    if (nim && nim !== currentStudent.nim) {
      const { rows: existingNim } = await pool.query('SELECT id FROM students WHERE nim = $1', [nim]);
      if (existingNim.length > 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'Student NIM is already registered'
        });
      }
    }

    // Check duplicate Email if Email is updated
    if (email && email !== currentStudent.email) {
      const { rows: existingEmail } = await pool.query('SELECT id FROM students WHERE email = $1', [email]);
      if (existingEmail.length > 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'Student Email is already registered'
        });
      }
    }

    // Update query dynamically based on supplied fields
    const updatedStudent = {
      nim: nim !== undefined ? nim : currentStudent.nim,
      name: name !== undefined ? name : currentStudent.name,
      email: email !== undefined ? email : currentStudent.email,
      phone: phone !== undefined ? phone : currentStudent.phone,
      major: major !== undefined ? major : currentStudent.major
    };

    await pool.query(
      'UPDATE students SET nim = $1, name = $2, email = $3, phone = $4, major = $5 WHERE id = $6',
      [
        updatedStudent.nim,
        updatedStudent.name,
        updatedStudent.email,
        updatedStudent.phone || null,
        updatedStudent.major,
        id
      ]
    );

    res.status(200).json({
      status: 'success',
      message: 'Student updated successfully',
      data: {
        id: parseInt(id),
        ...updatedStudent
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { rows: students } = await pool.query('SELECT id FROM students WHERE id = $1', [id]);
    if (students.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Student not found'
      });
    }

    await pool.query('DELETE FROM students WHERE id = $1', [id]);

    res.status(200).json({
      status: 'success',
      message: 'Student deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
