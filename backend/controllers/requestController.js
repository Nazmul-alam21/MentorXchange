import Request from "../models/request.js";
import { createNotificationIfNotExists, markNotificationsAsReadByType } from "./notificationController.js";
import user from "../models/users.js";
import Notification from "../models/notification.js";
import Profile from "../models/profile.js";
import Mentorship from "../models/mentorship.js";


const COOLDOWN_DAYS = 7;


// Send a mentorship request

export const sendRequest = async (req, res) => {

    try {

        const { from, to } = req.body;

        if (from === to) {
            return res.status(400).json({ message: "You cannot send request to yourself" });
        }

        // Check if request already sent
        const existing = await Request.findOne({ from, to, status: "pending" });

        if (existing) {
            return res.status(400).json({ message: "Request already sent" });
        }

        // Cooldown check (after mentorship ended)
        const lastMentorship = await Mentorship.findOne({
            $or: [
                { userA: from, userB: to },
                { userA: to, userB: from }
            ]
        }).sort({ updatedAt: -1 });

        if (lastMentorship && lastMentorship.status === "ended") {
            const endedAt = new Date(lastMentorship.updatedAt);
            const now = new Date();

            const diffInMs = now - endedAt;
            const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

            if (diffInDays < COOLDOWN_DAYS) {
                const remainingDays = Math.ceil(COOLDOWN_DAYS - diffInDays);

                return res.status(403).json({
                    message: `You can reconnect after ${remainingDays} day(s).`
                });
            }
        }


        const newRequest = new Request({ from, to });
        await newRequest.save();

        await createNotificationIfNotExists({
            user: to,
            type: "request",
            message: "You have received a new mentorship request",
            link: "/requests",
            meta: {
                requestId: newRequest._id
            }
        });

        return res.status(200).json({ message: "Request sent", request: newRequest });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

};



// Accept or Reject request

export const respondRequest = async (req, res) => {

    try {

        const { requestId, action } = req.body;

        if (!requestId || !action) {
            return res.status(400).json({ message: "requestId and action are required" });
        }

        if (!["accepted", "rejected"].includes(action)) {
            return res.status(400).json({ message: "Invalid action" });
        }

        const request = await Request.findById(requestId);

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        request.status = action;
        await request.save();

        if (action === "accepted") {
            await Mentorship.create({
                userA: request.from,
                userB: request.to,
            });
        }

        const respondedBy = await user.findById(request.to).select("name");

        await createNotificationIfNotExists({
            user: request.from,
            type: "request",
            message: action === "accepted"
                ? `Your mentorship request was accepted by ${respondedBy?.name || "the user"}. Start a conversation in Chats.`
                : `Your mentorship request was rejected by ${respondedBy?.name || "the user"}`,
            link: action === "accepted" ? `/chats/${request.to}` : undefined
        });

        await Notification.updateMany(
            { "meta.requestId": request._id },
            { $set: { isResolved: true } }
        );

        await markNotificationsAsReadByType(request.to, "request");

        return res.status(200).json({ success: true, request });

    } catch (error) {
        console.error("Respond request error:", error);
        return res.status(500).json({ message: error.message });
    }

};



// View received request

export const getReceivedRequest = async (req, res) => {

    try {

        const { userId } = req.body;

        const requests = await Request.find({ to: userId, status: "pending" })
            .populate("from", ["name", "email"]);

        await markNotificationsAsReadByType(userId, "request");

        return res.status(200).json(requests);

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

}


export const getActiveMentorships = async (req, res) => {
    try {
        const userId = req.query.userId?.toString();
        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        let mentorships = await Mentorship.find({
            status: "active",
            $or: [{ userA: userId }, { userB: userId }],
        });

        const acceptedRequests = await Request.find({
            status: "accepted",
            $or: [{ from: userId }, { to: userId }],
        });

        for (const reqItem of acceptedRequests) {
            const exists = await Mentorship.findOne({
                $or: [
                    { userA: reqItem.from, userB: reqItem.to },
                    { userA: reqItem.to, userB: reqItem.from }
                ],
            });

            if (!exists) {
                const newMentorship = await Mentorship.create({
                    userA: reqItem.from,
                    userB: reqItem.to,
                    status: "active",
                });
                mentorships.push(newMentorship);
            }
        }

        if (mentorships.length === 0) {
            return res.json([]);
        }

        const connectedUserIds = mentorships.map(m =>
            m.userA.toString() === userId ? m.userB : m.userA
        );

        const users = await user.find(
            { _id: { $in: connectedUserIds } },
            { name: 1 }
        );

        const profiles = await Profile.find({
            user: { $in: connectedUserIds },
        });

        const result = users.map(u => {
            const profile = profiles.find(
                p => p.user.toString() === u._id.toString()
            );

            const mentorship = mentorships.find(
                m =>
                    m.userA.toString() === u._id.toString() ||
                    m.userB.toString() === u._id.toString()
            );

            return {
                _id: u._id,
                name: u.name,
                bio: profile?.bio || "",
                education: profile?.education || "",
                experience: profile?.experience || "",
                mentorshipId: mentorship._id,
            };
        });

        return res.status(200).json(result);

    } catch (error) {
        console.error("Active mentorships error:", error);
        return res.status(500).json({ message: error.message });
    }
};


// DEBUG: show all requests in DB for a user
export const debugRequestsForUser = async (req, res) => {
    try {
        const { userId } = req.body;

        const requests = await Request.find({
            $or: [{ from: userId }, { to: userId }]
        });

        return res.json({
            userId,
            total: requests.length,
            requests
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
