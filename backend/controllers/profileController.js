import Profile from "../models/profile.js";

const normalizeSkills = (skills = []) => {
    const seen = new Set();
    const original = [];
    const normalized = [];

    skills.forEach(skill => {
        const trimmed = skill.trim();
        if (!trimmed) return;

        const lower = trimmed.toLowerCase();

        if (!seen.has(lower)) {
            seen.add(lower);
            original.push(trimmed);
            normalized.push(lower);
        }
    });

    return { original, normalized };
};



// Create or Update Profile

export const create_or_update_profile = async (req, res) => {

    try {

        const { user, bio, skillsOffered, skillsWanted, interests, availability, currentRole, education, experience, location } = req.body;

        const profile = await Profile.findOne({ user });

        if (profile) {
            // Update existing profile
            profile.bio = bio ?? profile.bio;
            profile.currentRole = currentRole ?? profile.currentRole;
            profile.education = education ?? profile.education;
            profile.experience = experience ?? profile.experience;
            if (location) {
                profile.location = {
                    country: location.country ?? profile.location?.country,
                    city: location.city ?? profile.location?.city
                };
            }

            if (skillsOffered) {
                const { original, normalized } = normalizeSkills(skillsOffered);
                profile.skillsOffered = original;
                profile.skillsOfferedNormalized = normalized;
            }

            if (skillsWanted) {
                const { original, normalized } = normalizeSkills(skillsWanted);
                profile.skillsWanted = original;
                profile.skillsWantedNormalized = normalized;
            }

            profile.interests = interests ?? profile.interests;
            profile.availability = availability ?? profile.availability;

            await profile.save();

            return res.status(200).json(profile);
        }

        // Create new profile
        const offered = normalizeSkills(skillsOffered || []);
        const wanted = normalizeSkills(skillsWanted || []);

        const newProfile = new Profile({
            user,
            bio,
            currentRole,
            education,
            experience,
            location: location
            ? {
                country: location.country,
                city: location.city
            }
            : undefined,
            skillsOffered: offered.original,
            skillsOfferedNormalized: offered.normalized,
            skillsWanted: wanted.original,
            skillsWantedNormalized: wanted.normalized,
            interests,
            availability
        });

        await newProfile.save();

        return res.status(201).json(newProfile);

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

};


// Get profile by userId

export const getMyProfile = async (req, res) => {

    try {

        const { userId } = req.body;

        const profile = await Profile.findOne({ user: userId })
            .populate("user", ["name", "email"]);

        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        return res.status(200).json(profile);

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

};


// Get profile by userId (public view)

export const getProfileByUserId = async (req, res) => {

    try {

        const { userId } = req.params;

        const profile = await Profile.findOne({ user: userId })
            .populate("user", ["name", "email"]);

        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        return res.status(200).json(profile);

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

};