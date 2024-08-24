import express from "express";
import { protectedRoute } from "../middleware/protectedRoute.js";
import { addComment, addNewPost, bookmarkPost, deletePost, getAllPost, getCommentsOfPost, getUserPost, likeDislikePost } from "../controllers/post.controller.js";
import upload from "../middleware/multer.js";
const router = express.Router()

router.post("/addpost",protectedRoute,upload.single("image"),addNewPost)
router.get("/all",protectedRoute,getAllPost)
router.get("/userpost/all",protectedRoute,getUserPost)
router.get("/:postId/likedislike",protectedRoute,likeDislikePost)
router.post("/:postId/comment",protectedRoute,addComment)
router.post("/:postId/commentall",protectedRoute,getCommentsOfPost)
router.post("/:postId/delete",protectedRoute,deletePost)
router.post("/:postId/bookmark",protectedRoute,bookmarkPost)

export default router