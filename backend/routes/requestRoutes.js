import express from "express";
import { getActiveMentorships, getReceivedRequest, respondRequest, sendRequest } from "../controllers/requestController.js";


const router = express.Router();

router.route("/request/send").post(sendRequest);
router.route("/request/respond").post(respondRequest);
router.route("/request/received").post(getReceivedRequest);
router.route("/request/active").post(getActiveMentorships);



export default router;