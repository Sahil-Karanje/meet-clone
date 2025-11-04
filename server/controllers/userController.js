import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "e46442198535a66c76eee26a1e24f96343e67a927c5fd664bca032bc97d0936b";

// 🔐 Register a new user
export const register = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed, name });

    res.status(201).json({
      message: "User registered",
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 🔐 Login and issue JWT
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// 🔍 Get user by ID (protected route)
export const getUserById = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findByPk(userId, {
      attributes: ["id", "email", "name", "avatarUrl", "role", "createdAt"],
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
