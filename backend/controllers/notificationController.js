import Notification from "../models/notification.js";

export const createNotificationIfNotExists = async ({
    user,
    type,
    message,
    link,
    meta,
    isResolved = false
}) => {
    if (meta?.requestId) {
    const existing = await Notification.findOne({
        user,
        type,
        "meta.requestId": meta.requestId,
        isResolved: false
    });

    if (existing) return;

    }
    

    await Notification.create({
        user,
        type,
        message,
        link,
        meta,
        isResolved
    });
};

// Get all notifications for a user
export const getNotifications = async (req, res) => {
    try {
        const { userId } = req.body;

        const notifications = await Notification.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark a notification as read
export const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.body;

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
        );

        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const markNotificationsAsReadByType = async (userId, type) => {
    await Notification.updateMany(
        {user: userId, type, isRead: false},
        {isRead: true}
    );
};

export const markByType = async (req, res) => {

    try {

        const {userId, type} = req.body;

        if (!userId || !type) {
            return res.status(400).json({message: "UserId and type required"});
        }

        await Notification.updateMany(
            {user: userId, type, isRead: false},
            {isRead: true}
        );

        res.status(200).json({message: "Notifications marked as read"});

    } catch (error) {
        res.status(500).json({message: error.message});
    }

};

export const getUnreadNotificationCount = async (req, res) => {

    try {

        const {userId} = req.body;

        if (!userId) {
            return res.status(400).json({message: "User ID is required"});
        }

        const unreadCount = await Notification.countDocuments({
            user: userId,
            isRead: false
        });

        res.status(200).json({unreadCount});

    } catch (error) {
        res.status(500).json({message: error.message});
    }
};