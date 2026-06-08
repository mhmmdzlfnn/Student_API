import request from 'supertest';
import app from '../src/app.js';
import pool from '../src/config/db.js';

describe('Student API Integration Tests', () => {
  let adminToken;
  let staffToken;
  let createdStudentId;
  let createdCourseId;

  // Cleanup DB connections after all tests run
  afterAll(async () => {
    await pool.end();
  });

  describe('1. Authentication Endpoints', () => {
    it('should successfully log in admin user and return token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@studentapi.com',
          password: 'adminpassword'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body).toHaveProperty('token');
      expect(res.body.data.role).toBe('admin');
      adminToken = res.body.token;
    });

    it('should successfully log in staff user and return token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'staff@studentapi.com',
          password: 'staffpassword'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body).toHaveProperty('token');
      expect(res.body.data.role).toBe('staff');
      staffToken = res.body.token;
    });

    it('should fail to login with wrong credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@studentapi.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('fail');
    });

    it('should get profile of logged in user', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.username).toBe('admin');
    });
  });

  describe('2. Students CRUD & RBAC', () => {
    it('should deny student creation for staff role (RBAC)', async () => {
      const res = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          nim: '10112009',
          name: 'Staff Created Student',
          email: 'staffstudent@example.com',
          major: 'Informatics'
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.status).toBe('fail');
    });

    it('should allow student creation for admin role', async () => {
      const res = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nim: '10112004',
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '081234567890',
          major: 'Computer Science'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('id');
      createdStudentId = res.body.data.id;
    });

    it('should retrieve list of students for staff (with default pagination)', async () => {
      const res = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.metadata.page).toBe(1);
      expect(res.body.data.students.length).toBeGreaterThan(0);
    });

    it('should support search query', async () => {
      const res = await request(app)
        .get('/api/students?search=Jane')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.students.some(s => s.name.includes('Jane'))).toBe(true);
    });

    it('should allow admin to update student', async () => {
      const res = await request(app)
        .put(`/api/students/${createdStudentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Jane Doe Updated'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.name).toBe('Jane Doe Updated');
    });
  });

  describe('3. Course Management & JOIN query', () => {
    it('should allow admin to create a course', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'IF-202',
          name: 'Web Programming II',
          credits: 3
        });

      expect(res.statusCode).toBe(201);
      createdCourseId = res.body.data.id;
    });

    it('should allow admin to enroll student in a course (many-to-many)', async () => {
      const res = await request(app)
        .post('/api/courses/enroll')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          student_id: createdStudentId,
          course_id: createdCourseId,
          enrollment_date: '2026-06-09',
          semester: 'Even 2025/2026'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
    });

    it('should fetch courses of student via JOIN query', async () => {
      const res = await request(app)
        .get(`/api/courses/student/${createdStudentId}`)
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.courses.length).toBeGreaterThan(0);
      expect(res.body.data.courses[0].code).toBe('IF-202');
    });
  });

  describe('4. Cleanup testing records', () => {
    it('should delete the test student', async () => {
      const res = await request(app)
        .delete(`/api/students/${createdStudentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
    });

    it('should delete the test course', async () => {
      const res = await request(app)
        .delete(`/api/courses/${createdCourseId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
    });
  });
});
