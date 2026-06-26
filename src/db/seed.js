import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding database...');

  // 1. Clear old data (in reverse dependency order)
  await pool.query('DELETE FROM enrollments');
  await pool.query('DELETE FROM courses');
  await pool.query('DELETE FROM students');
  await pool.query('DELETE FROM users');

  // 2. Seed Users (with hashed passwords)
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('adminpassword', salt);
  const staffPassword = await bcrypt.hash('staffpassword', salt);

  await pool.query(
    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?), (?, ?, ?, ?)',
    [
      'admin', 'admin@academia.com', adminPassword, 'admin',
      'staff', 'staff@academia.com', staffPassword, 'staff'
    ]
  );
  console.log('seeded users: admin (adminpassword), staff (staffpassword)');

  // 3. Seed Students
  await pool.query(
    'INSERT INTO students (nim, name, email, phone, major) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)',
    [
      '10112001', 'Budi Santoso', 'budi@example.com', '08123456789', 'Informatics',
      '10112002', 'Siti Rahma', 'siti@example.com', '08234567890', 'Information Systems',
      '10112003', 'Rian Hidayat', 'rian@example.com', '08345678901', 'Computer Science'
    ]
  );
  console.log('seeded students: 3 students added');

  // 4. Seed Courses
  await pool.query(
    'INSERT INTO courses (code, name, credits) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)',
    [
      'IF-101', 'Introduction to Programming', 3,
      'SI-201', 'Database Systems', 4,
      'CS-301', 'Software Engineering', 3
    ]
  );
  console.log('seeded courses: 3 courses added');

  // Get student and course IDs
  const [students] = await pool.query('SELECT id FROM students');
  const [courses] = await pool.query('SELECT id FROM courses');

  const budiId = students[0].id;
  const sitiId = students[1].id;
  const rianId = students[2].id;

  const progId = courses[0].id;
  const dbId = courses[1].id;
  const seId = courses[2].id;

  // 5. Seed Enrollments
  await pool.query(
    'INSERT INTO enrollments (student_id, course_id, enrollment_date, semester) VALUES (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)',
    [
      budiId, progId, '2026-02-15', 'Odd 2025/2026',
      budiId, dbId, '2026-02-15', 'Odd 2025/2026',
      sitiId, dbId, '2026-02-16', 'Odd 2025/2026'
    ]
  );
  console.log('seeded enrollments: Budi enrolled in Prog & DB, Siti in DB');

  console.log('Database seeding completed successfully.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
