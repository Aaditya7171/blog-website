import express from "express";

import {
    addComment, deleteComment
} from "../controllers/commentController.js";

import { authenticate } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:postId", authenticate, addComment);
router.delete("/:id", authenticate, deleteComment);

export default router;