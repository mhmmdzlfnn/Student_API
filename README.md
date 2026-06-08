# Student API - Backend Developer Project

A professional RESTful API for managing students, courses, and course enrollments. Built with **Node.js**, **Express.js**, and **MySQL/MariaDB**.

This project implements the full 8-week backend developer roadmap, incorporating premium design standards, security best practices (JWT authentication, RBAC, Rate Limiting), Morgan request logging, Swagger documentation, and Jest integration testing.

---

## Features

- **JWT Authentication**: Secure registration and login with passwords hashed using `bcryptjs`.
- **Role-Based Access Control (RBAC)**:
  - **Staff**: Can read student and course details (`GET`).
  - **Admin**: Has full access, including create, update, and delete actions (`POST`, `PUT`, `DELETE`), and enrolling students in courses.
- **Student CRUD**: Complete management of student data with input validation.
- **Search, Pagination & Sorting**:
  - Filter students by `name`, `nim`, or `major`.
  - Server-side pagination with full response metadata (`page`, `limit`, `totalCount`, `totalPages`).
  - Sort by any whitelisted column (e.g., `name`, `nim`, `major`) in `ASC` or `DESC` order.
- **Many-to-Many Relationships**: Enroll students in courses via an intermediate `enrollments` table using complex SQL `JOIN` queries.
- **Swagger Documentation**: Interactive API documentation generated inline and served via Swagger UI at `/api-docs`.
- **Rate Limiting**: Protects API routes from DDoS and brute-force requests.
- **Logging**: Console request logging using `morgan`.
- **Integration Testing**: 14 robust tests verifying API logic using `jest` and `supertest`.

---

## Tech Stack

- **Core**: Node.js (ES Modules), Express.js
- **Database**: MySQL / MariaDB (via `mysql2/promise` connection pool)
- **Security**: jsonwebtoken, bcryptjs, express-rate-limit
- **Validation**: Joi
- **Documentation**: Swagger UI, swagger-jsdoc
- **Logging**: Morgan
- **Testing**: Jest, Supertest

---

## Project Structure

```
├── src/
│   ├── config/
│   │   ├── db.js          # MySQL connection pool configuration
│   │   └── swagger.js     # Swagger JSDoc settings
│   ├── controllers/
│   │   ├── authController.js    # Register, login, profile logic
│   │   ├── studentController.js # Student CRUD with search/pagination
│   │   └── courseController.js  # Course CRUD & enrollment (JOIN query)
│   ├── db/
│   │   ├── schema.sql     # SQL DDL script defining tables
│   │   ├── migrate.js     # Runner to rebuild/run schema.sql
│   │   └── seed.js        # Script to populate initial mock data
│   ├── middlewares/
│   │   ├── authMiddleware.js    # JWT token verification
│   │   ├── roleMiddleware.js    # RBAC restriction middleware
│   │   ├── validationMiddleware.js # Joi request body validator
│   └── app.js             # Express app setup and middleware routing
│   └── server.js          # App entry point (HTTP server listen)
├── tests/
│   └── api.test.js        # Jest integration tests
├── .env                   # Environment configurations
├── package.json           # Scripts and dependencies configuration
└── README.md              # Project documentation
```

---

## Setup and Installation

### 1. Prerequisite
Ensure you have [Node.js](https://nodejs.org/) (v16+) and [MySQL/MariaDB](https://mariadb.org/) installed and running on your local machine.

### 2. Install Dependencies
Clone or copy this directory, open your terminal inside the root directory, and run:
```bash
npm install
```

### 3. Environment Configuration
Create or edit the `.env` file in the root directory and configure your credentials:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=student_db
DB_PORT=3306
JWT_SECRET=super_secret_key_student_api_2026
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

### 4. Database Setup & Migration
Automatically create the `student_db` database and its tables:
```bash
npm run migrate
```

### 5. Seed Mock Data
Insert test users (Admin & Staff), courses, students, and enrollments:
```bash
npm run seed
```
**Seed Accounts Created:**
- **Admin**: `admin@studentapi.com` (Password: `adminpassword`)
- **Staff**: `staff@studentapi.com` (Password: `staffpassword`)

---

## Running the Application

### Start Development Server
Runs the application with automatic code reload using `nodemon`:
```bash
npm run dev
```
The server will start at: [http://localhost:5000](http://localhost:5000)

### Access Swagger Interactive API Docs
Once the server is running, navigate to:
👉 [**http://localhost:5000/api-docs**](http://localhost:5000/api-docs)

You can authenticate directly in the Swagger UI by registering, logging in, copying the JWT token, clicking **"Authorize"**, and entering it as a Bearer token.

---

## Running Integration Tests

To run the automated test suite:
```bash
npm run test
```
This runs 14 tests validating register/login flows, RBAC restrictions, student CRUD, search, pagination, and course/student JOIN relations.
