import { pool } from "../config/db.js";
import {
    createPostSchema, updatePostSchema
} from "../schemas/postSchema.js";

// writer only
export const createPost = async (req, res) => {
    try {
        const data = createPostSchema.parse(req.body);

        const result = await pool.query(
            `INSERT INTO posts (title, content, tags, status, author_id) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [
                data.title,
                data.content,
                data.tags || [],
                data.status || "draft",
                req.user.id,
            ]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// whoever owns
export const updatePost = async (req, res) => {
    try {
        const data = updatePostSchema.parse(req.body);

        const postResult = await pool.query(
            "SELECT * FROM posts WHERE id = $1", [req.params.id]
        );
        const post = postResult.rows[0];

        if (!post) {
            return res.status(403).json({ error: "Post not found" });
        }

        if (
            req.user.role !== "admin" &&
            post.author_id !== req.user.id
        ) {
            return res.status(403).json({ error: "Not your post" });
        }

        const updated = await pool.query(
            `UPDATE posts 
            SET title = COALESCE($1, title),
                content = COALESCE($2, content),
                tags = COALESCE($2, tags),
                status = COALESCE($4, status)
            WHERE id = $5
            Returning *`,
            [
                data.title,
                data.content,
                data.tags,
                data.status,
                req.params.id,
            ]
        );
        res.json(updated.rows[0]);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const deletePost = async (req, res) => {
    try {
        const postResult = await pool.query(
            "SELECT * FROM posts WHERE id = $1",
            [req.params.id]
        );
        const post = postResult.rows[0];

        if (!post) return res.status(404).json({ error: "Post not found" });

        if (
            req.user.role !== "admin" &&
            post.author_id !== req.user.id
        ) {
            return res.status(403).json({ error: "Not your post" });
        }

        await pool.query("DELETE FROM posts WHERE id = $1", [req.params.id]);

        res.json({ message: "Post deleted" });
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
}

export const getPublishedPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const offset = (page - 1) * limit;

        const search = req.query.search || "";
        const result = await pool.query(
            `SELECT * 
            FROM posts 
            WHERE status = 'published'
            AND (
                title ILIKE $1 OR 
                content ILIKE $1 OR
                $2 = ANY(tags)
            )
            ORDER BY created_at DESC
            LIMIT $3 OFFSET $4`,
            [`%${search}%`, search, limit, offset]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};




// {
//     "user": {
//         "id": 2,
//             "email": "testwriter@gmail.com",
//                 "password": "$2b$10$8F6adI.wTgnOMc9CdGikkOze7na3PXqudZ2CgUJ1aBXIPRhdxy12.",
//                     "role": "writer"
//     },
//     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6IndyaXRlciIsImlhdCI6MTc3MjAyNzQ5OCwiZXhwIjoxNzcyNjMyMjk4fQ.FUb6ZvPUPKQ-N4-vaoVSpI1rV_gtAbkgZnfRQQPRvjs"
// }

// {
//     "user": {
//         "id": 3,
//             "email": "testreader@gmail.com",
//                 "password": "$2b$10$pQS2MA6Xnax9mHiC/5R6DeeQr6X6yQ.VzjeLCSDNbljpr5N5AsLjW",
//                     "role": "reader"
//     },
//     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Mywicm9sZSI6InJlYWRlciIsImlhdCI6MTc3MjAyNzU0NiwiZXhwIjoxNzcyNjMyMzQ2fQ.5_9ytSmSnPuJwbz7LG7uLaynqXF91rjU-9GROdLA8U0"
// }

// {
//     "user": {
//         "id": 4,
//             "email": "admin@gmail.com",
//                 "password": "$2b$10$tJM3rz.m0avzWAmoTl0HquPk.HpJgb.K0GSBjjGM1k8V1e8phiIMS",
//                     "role": "admin"
//     },
//     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzcyMDI3NTczLCJleHAiOjE3NzI2MzIzNzN9.CIVZQYQDEmKSYtKIOn7qyxdpfkR9qOePTer6WyAMGyw"
// }

// "{
// "id": 4,
//     "title": "Draft post",
//         "content": "This is a third published post content example",
//             "tags": [
//                 "test"
//             ],
//                 "status": "published",
//                     "created_at": "2026-02-25T08:25:41.318Z",
//                         "author_id": 2
// }"

// {
//     "user": {
//         "id": 5,
//             "email": "new@gmail.com",
//                 "password": "$2b$10$TpSTCCncXFLyhcgTvSL2oO8cRrQN31UaJYd5QQi5UrJaPsjk1SMU2",
//                     "role": "writer"
//     },
//     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NSwicm9sZSI6IndyaXRlciIsImlhdCI6MTc3MjAyNzg5MCwiZXhwIjoxNzcyNjMyNjkwfQ.05WyB1n-PeQfBOKYh8a7q1hPZuqLbmkoBE-AoaUidDk"
// }