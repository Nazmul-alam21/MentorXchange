import Message from "../models/message.js";
import Request from "../models/request.js";


const isChatAllowed = async (userA, userB) => {

    const request = await Request.findOne({
        $or: [
            { from: userA, to: userB, status: "accepted" },
            { from: userB, to: userA, status: "accepted" }
        ]
    });

    return !!request;

};

// Send a message
export const sendMessage = async (req, res) => {

    try {

        const { from, to, content } = req.body;

        if (!from || !to || !content) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const allowed = await isChatAllowed(from, to);
        if (!allowed) {
            return res.status(403).json({
                message: "Chat allowed only after request is accepted"
            });
        }

        const newMessage = new Message({
            sender: from,
            receiver: to,
            content,
            isRead: false
        });

        await newMessage.save();

        return res.status(201).json({
            message: "Message sent",
            data: newMessage
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

};


// Get conversation between two users

export const getConversation = async (req, res) => {

    try {

        const { userId, otherUserId } = req.body;

        if (!userId || !otherUserId) {
            return res.status(400).json({ message: "User IDs are required" });
        }

        const allowed = await isChatAllowed(userId, otherUserId);
        if (!allowed) {
            return res.status(403).json({
                message: "Chat not allowed"
            });
        }

        await Message.updateMany(
            {
                sender: otherUserId,
                receiver: userId,
                isRead: false
            },
            {
                isRead: true
            }
        );

        const conversation = await Message.find({
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId }
            ]
        }).sort({ createdAt: 1 });

        return res.status(200).json(conversation);

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

};


export const getChatList = async (req, res) => {

    try {

        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const acceptedRequests = await Request.find({
            status: "accepted",
            $or: [
                { from: userId },
                { to: userId }
            ]
        }).populate("from to", "name email");

        const chatMap = new Map();

        acceptedRequests.forEach(req => {
            const otherUser =
                req.from._id.toString() === userId
                    ? req.to
                    : req.from;

            chatMap.set(otherUser._id.toString(), {
                userId: otherUser._id,
                name: otherUser.name,
                email: otherUser.email,
                lastMessage: null,
                lastMessageAt: null,
                unreadCount: 0
            });

        });

        const messages = await Message.find({
            $or: [
                { sender: userId },
                { receiver: userId }
            ]
        })
            .sort({ createdAt: -1 })
            .populate("sender receiver", "name email");

        messages.forEach(msg => {
            const otherUser = 
            msg.sender._id.toString() === userId
            ? msg.receiver
            : msg.sender;

            const key = otherUser._id.toString();

            if (!chatMap.has(key)) {
                chatMap.set(key, {
                    userId: otherUser._id,
                    name: otherUser.name,
                    email: otherUser.email,
                    lastMessage: msg.content,
                    lastMessageAt: msg.createdAt,
                    unreadCount: 0
                });
            }

            const chat = chatMap.get(key);

            if (!chat.lastMessageAt || msg.createdAt > chat.lastMessageAt) {
                chat.lastMessage = msg.content;
                chat.lastMessageAt = msg.createdAt;
            }

            if (
                msg.receiver._id.toString() === userId && 
                msg.isRead === false
            ) {
                chat.unreadCount += 1;
            }
        });

        const chatList = Array.from(chatMap.values())
            .sort((a, b) => {
                if (!a.lastMessageAt) return 1;
                if (!b.lastMessageAt) return -1;
                return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
            });

        return res.status(200).json(chatList);

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

};


export const getUnreadMessageCount = async (req, res) => {

    try {

        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const unreadMessage = await Message.find({
            receiver: userId,
            isRead: false
        }).select("sender");

        const uniqueChats = new Set(
            unreadMessage.map(m => m.sender.toString())
        );

        return res.status(200).json({ unreadCount: uniqueChats.size });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

};


export const markMessagesAsRead = async (req, res) => {
    try {
        const { userId, otherUserId } = req.body;

        if (!userId || !otherUserId) {
            return res.status(400).json({ message: "User IDs are required" });
        }

        await Message.updateMany(
            { sender: otherUserId, receiver: userId, isRead: false },
            { isRead: true }
        );

        return res.status(200).json({ message: "Messages marked as read" });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};