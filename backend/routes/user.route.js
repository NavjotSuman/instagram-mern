import express from "express";
import { editProfile, followUnfollowUser, getProfile, login, logout, register, suggestedUser } from "../controllers/user.controller.js";
import { protectedRoute } from "../middleware/protectedRoute.js";
import upload from "../middleware/multer.js";
const router = express.Router()


router.post("/register",register)
router.post("/login",login)
router.get("/logout",logout)
router.get("/:username/profile",getProfile)
router.put("/profile/edit", protectedRoute, upload.single("profilePhoto"),editProfile);
router.get("/suggested",protectedRoute,suggestedUser)
router.post("/followUnfollow/:id",protectedRoute,followUnfollowUser)


export default router 