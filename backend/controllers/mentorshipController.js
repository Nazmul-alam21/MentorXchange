import Mentorship from "../models/mentorship.js";
import User from "../models/users.js";
import { createNotificationIfNotExists } from "./notificationController.js";
import Message from "../models/message.js";
import Request from "../models/request.js";

export const endMentorship = async (req, res) => {

  try {

    const { mentorshipId, userId } = req.body;

    console.log("END REQUEST:", req.body);

    if (!mentorshipId || !userId) {
      return res.status(400).json({ message: "mentorshipId and userId are required" });
    }

    const mentorship = await Mentorship.findById(mentorshipId);
    
    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship not found" });
    }

    const userIdStr = userId.toString();

    const isParticipant = 
      mentorship.userA.toString() === userIdStr || 
      mentorship.userB.toString() === userIdStr;

      if (!isParticipant) {
      return res.status(403).json({ message: "Not authorized to end this mentorship" });
    }

    if (mentorship.status === "ended") {
      return res.status(400).json({ message: "Mentorship is already ended" });
    }

    mentorship.status = "ended";
    mentorship.endedBy = userId;
    await mentorship.save();

    // Delete all chat messages between both users
await Message.deleteMany({
  $or: [
    { sender: mentorship.userA, receiver: mentorship.userB },
    { sender: mentorship.userB, receiver: mentorship.userA }
  ]
});

// Remove accepted request so chat disappears from My Chats
await Request.deleteOne({
  $or: [
    { from: mentorship.userA, to: mentorship.userB },
    { from: mentorship.userB, to: mentorship.userA }
  ],
  status: "accepted"
});



    const otherUserId =
    mentorship.userA.toString() === userIdStr
      ? mentorship.userB
      : mentorship.userA;

      const endedByUser = await User.findById(userId).select("name");

      await createNotificationIfNotExists({
        user: otherUserId,
        type: "mentorship",
        message: `${endedByUser.name || "A user"} has ended the mentorship with you`,
        link: "/dashboard",
        meta: {
          mentorshipId: mentorship._id
        }
      });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("End mentorship error:", err);
    return res.status(500).json({ message: err.message });

  }
};