import express from "express";
import { getChatList, getConversation, getUnreadMessageCount, markMessagesAsRead, sendMessage } from "../controllers/messageControllers.js";


const router = express.Router();


router.route("/send").post(sendMessage);
router.route("/conversation").post(getConversation);
router.route("/chats").post(getChatList);
router.route("/unread-count").post(getUnreadMessageCount);
router.route("/mark-read").post(markMessagesAsRead);

export default router;