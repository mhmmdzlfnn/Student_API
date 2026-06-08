import Joi from 'joi';

// Helper middleware to validate request body
export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const details = error.details.map((detail) => detail.message);
      return res.status(400).json({
        status: 'fail',
        message: 'Validation error',
        errors: details
      });
    }
    next();
  };
};

// Auth Schemas
export const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'staff').optional()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Student Schemas
export const studentSchema = Joi.object({
  nim: Joi.string().pattern(/^[0-9]+$/).min(6).max(20).required().messages({
    'string.pattern.base': 'NIM must contain only numbers'
  }),
  name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9]+$/).min(10).max(15).optional().allow(null, '').messages({
    'string.pattern.base': 'Phone must contain only numbers'
  }),
  major: Joi.string().min(2).max(100).required()
});

export const studentUpdateSchema = Joi.object({
  nim: Joi.string().pattern(/^[0-9]+$/).min(6).max(20).optional().messages({
    'string.pattern.base': 'NIM must contain only numbers'
  }),
  name: Joi.string().min(3).max(100).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^[0-9]+$/).min(10).max(15).optional().allow(null, ''),
  major: Joi.string().min(2).max(100).optional()
});

// Course Schemas
export const courseSchema = Joi.object({
  code: Joi.string().min(2).max(20).required(),
  name: Joi.string().min(3).max(100).required(),
  credits: Joi.number().integer().min(1).max(10).required()
});

// Enrollment Schemas
export const enrollmentSchema = Joi.object({
  student_id: Joi.number().integer().required(),
  course_id: Joi.number().integer().required(),
  enrollment_date: Joi.date().iso().required(),
  semester: Joi.string().min(3).max(20).required()
});
