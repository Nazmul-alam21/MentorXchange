import express from "express";
import { getNotifications, getUnreadNotificationCount, markAsRead, markByType } from "../controllers/notificationController.js";



const router = express.Router();

router.route("/get").post(getNotifications);
router.route("/read").post(markAsRead);
router.route("/read-by-type").post(markByType);
router.route("/unread-count").post(getUnreadNotificationCount);

export default router;