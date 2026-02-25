import express from "express";

import {
    createPost, updatePost, deletePost, getPublishedPosts
} from "../controllers/postController.js";

import { authenticate } from "../../middleware/authMiddleware.js";
import { authorize } from "../../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", getPublishedPosts);

router.post(
    "/", authenticate,
    authorize("writer", "admin"),
    createPost
);

router.put(
    "/:id", authenticate,
    authorize("writer", "admin"),
    updatePost
);

router.delete(
    "/:id",
    authenticate,
    authorize("writer", "admin"),
    deletePost
);

export default router;