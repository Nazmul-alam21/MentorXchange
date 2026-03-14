import express from "express";
import { create_or_update_profile, getMyProfile, getProfileByUserId } from "../controllers/profileController.js";



const router = express.Router();

router.route("/profile").post(create_or_update_profile);
router.route("/myprofile").post(getMyProfile);
router.route("/profile/:userId").get(getProfileByUserId);

export default router;