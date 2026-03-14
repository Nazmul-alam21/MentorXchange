import express from "express";
import { findMatches } from "../controllers/matchController.js";


const router = express.Router();

router.route("/matches").post(findMatches);

export default router;