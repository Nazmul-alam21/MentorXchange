import mongoose, { mongo } from "mongoose";


const notificationSchema = new mongoose.Schema({
    user: { // user who receive the notification
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: { // type of notification
        type: String,
        enum: ["request", "request_response", "message", "mentorship"],
        required: true
    },
    message: { // text displayed in notification
        type: String,
        required: true
    },
    isRead: { // mark as read/unread
        type: Boolean,
        default: false
    },
    meta: {
        requestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Request"
        }
    },
    isResolved: {
        type: Boolean,
        default: false
    },
    link: { // optional link to realted page (e.g, chat or request )
        type: String
    }

}, { timestamps: true });


const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;