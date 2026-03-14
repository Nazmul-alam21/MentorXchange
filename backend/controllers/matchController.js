import Profile from "../models/profile.js";
import Request from "../models/request.js";
import Mentorship from "../models/mentorship.js";


// Find matches for a user

export const findMatches = async (req, res) => {

    try {

        const { userId } = req.body;

        const myProfile = await Profile.findOne({ user: userId });

        const requests = await Request.find({
            $or: [
                { from: userId },
                { to: userId }
            ]
        });

        const mentorships = await Mentorship.find({
            $or: [{ userA: userId }, { userB: userId }]
        });

        const COOLDOWN_DAYS = 7;
        const now = new Date();

        const temporarilyBlockedUserIds = new Set();
        const permanentlyBlockedUserIds = new Set();
        const mentorshipCountMap = new Map();

        mentorships.forEach(m => {
            const otherUserId =
                m.userA.toString() === userId
                    ? m.userB.toString()
                    : m.userA.toString();

            const count = mentorshipCountMap.get(otherUserId) || 0;
            mentorshipCountMap.set(otherUserId, count + 1);

            if (m.status === "ended" && count + 1 >= 2) {
                permanentlyBlockedUserIds.add(otherUserId);
                return;
            }

            if (m.status === "ended" && m.updatedAt) {
                const diffDays =
                    (now - new Date(m.updatedAt)) / (1000 * 60 * 60 * 24);

                if (diffDays < COOLDOWN_DAYS) {
                    temporarilyBlockedUserIds.add(otherUserId);
                }
            }

            if (count + 1 >= 2 && m.status === "ended") {
                permanentlyBlockedUserIds.add(otherUserId);
            }
        });

        requests.forEach(req => {
            if (req.status === "rejected") {
                const otherUserId =
                    req.from.toString() === userId
                        ? req.to.toString()
                        : req.from.toString();

                permanentlyBlockedUserIds.add(otherUserId);
            }
        });

        const requestMap = new Map();

        requests.forEach(req => {
            const otherUserId =
                req.from.toString() === userId
                    ? req.to.toString()
                    : req.from.toString();

            requestMap.set(otherUserId, req.status);
        });

        // Block users with ACTIVE mentorships OR permanent game-over
        const activeMentorshipUserIds = mentorships
            .filter(m => m.status === "active")
            .map(m =>
                m.userA.toString() === userId
                    ? m.userB.toString()
                    : m.userA.toString()
            );

        const blockedUserIds = [
            ...new Set([
                ...activeMentorshipUserIds,
                ...Array.from(permanentlyBlockedUserIds),
                ...Array.from(temporarilyBlockedUserIds)
            ])
        ];

        if (!myProfile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        // Find other users who "match" me
        const matches = await Profile.find({
            user: {
                $ne: userId,
                $nin: blockedUserIds
            },
            $or: [ // exclude myself
                { skillsOfferedNormalized: { $in: myProfile.skillsWantedNormalized } }, // they offer what I want
                { skillsWantedNormalized: { $in: myProfile.skillsOfferedNormalized } }
            ] // they want what I can teach
        }).populate("user", ["name", "email"]);

        // If no matches found
        if (matches.length === 0) {
            return res.status(200).json({ message: "No matches found", matches: [] });
        }

        // Format the matches to return only needed info
        const formattedMatches = matches.map(m => {
            const otherUserId = m.user._id.toString();

            return {

                userId: otherUserId,
                name: m.user.name,
                email: m.user.email,
                bio: m.bio,
                skillsOffered: m.skillsOffered,
                skillsWanted: m.skillsWanted,
                requestStatus: requestMap.get(otherUserId) || "none"

            };
        });

        return res.status(200).json({ message: "Matches found", matches: formattedMatches });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

};