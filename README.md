# employee-management-system
A CRUD web app for managing employee records — React frontend, Express/Node.js backend, PostgreSQL database, tested with Postman.




Employee Management System
A full-stack CRUD application for managing employee records, built with React, Node.js/Express, and PostgreSQL, with Postman used for API testing.

Features
Add new employees with form validation (name, email, phone, age, address)
View all employees in a table
Edit existing employee details
Delete employees with confirmation
Client-side and server-side validation
Duplicate email prevention
Tech Stack
Frontend

React (functional components + hooks)
Fetch API for HTTP requests
Backend

Node.js
Express.js
CORS middleware
Database

PostgreSQL
pg (node-postgres) driver
API Testing

Postman
Project Structure
├── client/                # React frontend
│   ├── src/
│   │   ├── App.js
│   │   └── App.css
│   └── package.json
├── server/                 # Node/Express backend
│   ├── index.js
│   └── package.json
└── README.md
Database Schema
Table: emp1

Column	Type	Constraints
name	VARCHAR(50)	NOT NULL
email	VARCHAR(100)	NOT NULL, UNIQUE
phone	VARCHAR(10)	NOT NULL
age	INTEGER	NOT NULL, CHECK 1–120
address	VARCHAR(200)	Optional
The table is created automatically on server startup if it doesn't exist.

Getting Started
Prerequisites
Node.js installed
PostgreSQL installed and running
Backend Setup
bash
cd server
npm install
Create a .env file (or set environment variables):

DB_USER=postgres
DB_HOST=localhost
DB_NAME=db6
DB_PASSWORD=your_password
DB_PORT=5432
PORT=5000
Start the server:

bash
node index.js
Server runs at http://localhost:5000

Frontend Setup
bash
cd client
npm install
npm start
App runs at http://localhost:3000

API Endpoints
Method	Endpoint	Description
GET	/api/employee	Health check
GET	/api/employees	Fetch all employees
POST	/api/employees	Add a new employee
PUT	/api/employees/:email	Update an employee (pending backend implementation)
DELETE	/api/employees/:email	Delete an employee (pending backend implementation)
Validation Rules
Name: minimum 2 characters
Email: valid email format, must be unique
Phone: exactly 10 digits
Age: integer between 1 and 120
Address: optional
Known Gaps
PUT and DELETE routes are called from the frontend but not yet implemented on the backend — add these to index.js for edit/delete to work end-to-end.



