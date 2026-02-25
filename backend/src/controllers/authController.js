import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import { generateToken } from "../utils/jwt.js";
import { registerSchema, loginSchema } from "../schemas/authSchemas.js";

export const register = async (req, res) => {

    try {
        const data = registerSchema.parse(req.body);
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const result = await pool.query("INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING *",
            [data.email, hashedPassword, data.role || "reader"]
        );
        const user = result.rows[0];
        const token = generateToken(user);
        res.json({ user, token });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }

}

export const login = async (req, res) => {
    try {
        const data = loginSchema.parse(req.body);

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1", [data.email]
        );

        const user = result.rows[0];
        if (!user) return res.status(401).json({ error: "Invalid creds" });

        const validPassword = await bcrypt.compare(
            data.password, user.password
        );
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid Credentials" });
        }
        const token = generateToken(user);
        res.json({ user, token });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}