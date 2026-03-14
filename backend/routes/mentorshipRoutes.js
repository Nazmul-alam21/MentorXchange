import express from "express";
import { endMentorship } from "../controllers/mentorshipController.js";
import { getActiveMentorships } from "../controllers/requestController.js";

const router = express.Router();

router.route("/end").post(endMentorship);
router.route("/active").get(getActiveMentorships);

export default router;
