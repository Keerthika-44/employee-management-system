const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "db6",
  password: process.env.DB_PASSWORD || "1234",
  port: Number(process.env.DB_PORT) || 5432,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

pool.on("connect", () => {
  console.log("PostgreSQL connected successfully");
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error:", err.message);
});

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS emp1 (
      name VARCHAR(50) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      phone VARCHAR(10) NOT NULL,
      age INTEGER NOT NULL CHECK (age BETWEEN 1 AND 120),
      address VARCHAR(200)
    );
  `);
  console.log("emp1 table is ready");
}

function validateEmployee(data) {
  const errors = {};
  const { name, email, phone, age } = data;

  if (typeof name !== "string" || name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Enter a valid email address";
  }

  if (typeof phone !== "string" || !/^\d{10}$/.test(phone)) {
    errors.phone = "Phone number must be exactly 10 digits";
  }

  const numericAge = Number(age);
  if (
    age === "" ||
    age === undefined ||
    age === null ||
    !Number.isInteger(numericAge) ||
    numericAge < 1 ||
    numericAge > 120
  ) {
    errors.age = "Age must be between 1 and 120";
  }

  return errors;
}

app.get("/api/employee", (req, res) => {
  res.send("Employee Management API is running");
});

app.post("/api/employees", async (req, res) => {
  try {
    const errors = validateEmployee(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const { name, email, phone, age, address } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    const existing = await pool.query("SELECT 1 FROM emp1 WHERE email = $1", [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        errors: { email: "An employee with this email already exists" },
      });
    }

    const result = await pool.query(
      `INSERT INTO emp1 (name, email, phone, age, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        name.trim(),
        cleanEmail,
        phone,
        Number(age),
        typeof address === "string" && address.trim() ? address.trim() : null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Employee added successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error adding employee:", err);
    res.status(500).json({ success: false, message: "Server error while adding employee" });
  }
});

app.get("/api/employees", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM emp1");
    res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error("Error fetching employees:", err.message);
    res.status(500).json({ success: false, message: "Server error while fetching employees" });
  }
});

async function startServer() {
  try {
    await pool.query("SELECT 1");
    console.log("Database connection successful");

    await ensureTable();

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
}

startServer();