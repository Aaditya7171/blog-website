import { pool } from "../config/db.js";
import { createCommentSchema } from "../schemas/commentSchema.js";

export const addComment = async (req, res) => {
    try {
        const data = createCommentSchema.parse(req.body);
        const postResult = await pool.query(
            "SELECT * FROM posts WHERE id = $1", [req.params.postId]
        );

        const post = postResult.rows[0];

        if (!post || post.status !== "published") {
            return res.status(404).json({ error: "Post not found" });
        }

        const result = await pool.query(
            `INSERT INTO comments (content, user_id, post_id) VALUES ($1, $2, $3) RETURNING *`,
            [data.content, req.user.id, req.params.postId]
        );
        res.json(result.rows[0]);

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const commentResult = await pool.query(
            "SELECT * FROM comments WHERE id = $1", [req.params.id]
        );
        const comment = commentResult.rows[0];

        if (!comment) return res.status(404).json({ error: "Comment not found" });

        if (
            req.user.role !== "admin" &&
            comment.user_id !== req.user.id
        ) {
            return res.status(403).json({ error: "Not your comment" });
        }

        await pool.query("DELETE FROM comments WHERE id = $1", [req.params.id]);

        res.json({ message: "Comment deleted" });

    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}
