import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    bio: {
        type: String,
        trim: true
    },
    currentRole: {
        type: String,
        trim: true
    },
    education: {
        type: String,
        trim: true
    },
    experience: {
        type: String,
        trim: true
    },
    location: {
        country: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        }
    },
    skillsOffered: [String],
    skillsOfferedNormalized: [String],
    skillsWanted: [String],
    skillsWantedNormalized: [String],
    interests: [String],
    availability: {
        type: String
    },
}, { timestamps: true });


const Profile = new mongoose.model("Profile", profileSchema);
export default Profile;