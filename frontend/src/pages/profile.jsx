import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import "./Profile.css";


function Profile() {

    const { user } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);
    const [profileExists, setProfileExists] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState({});

    const [savedProfile, setSavedProfile] = useState(null);

    const [bio, setBio] = useState("");
    const [skillsOffered, setSkillsOffered] = useState("");
    const [skillsWanted, setSkillsWanted] = useState("");
    const [interests, setInterests] = useState("");
    const [availability, setAvailability] = useState("");
    const [currentRole, setCurrentRole] = useState("");
    const [education, setEducation] = useState("");
    const [experience, setExperience] = useState("");
    const [country, setCountry] = useState("");
    const [city, setCity] = useState("");


    useEffect(() => {
        if (!user) return;

        const fetchProfile = async () => {

            try {

                const res = await api.post("/myprofile", {
                    userId: user.id,
                });

                const profile = res.data;

                const formattedProfile = {

                    bio: profile.bio || "",
                    skillsOffered: profile.skillsOffered?.join(",") || "",
                    skillsWanted: profile.skillsWanted?.join(",") || "",
                    interests: profile.interests?.join(",") || "",
                    availability: profile.availability || "",
                    currentRole: profile.currentRole || "",
                    education: profile.education || "",
                    experience: profile.experience || "",
                    country: profile.location?.country || "",
                    city: profile.location?.city || "",

                };

                setSavedProfile(formattedProfile);

                setBio(formattedProfile.bio);
                setSkillsOffered(formattedProfile.skillsOffered);
                setSkillsWanted(formattedProfile.skillsWanted);
                setInterests(formattedProfile.interests);
                setAvailability(formattedProfile.availability);
                setCurrentRole(formattedProfile.currentRole);
                setEducation(formattedProfile.education);
                setExperience(formattedProfile.experience);
                setCountry(formattedProfile.country);
                setCity(formattedProfile.city);

                setProfileExists(true);
                setIsEditing(false);

            } catch (err) {
                // No profile exists
                setProfileExists(false);
                setIsEditing(true);
            } finally {
                setLoading(false);
            }

        };

        fetchProfile();
    }, [user]);


    const validateProfile = () => {

        const newErrors = {};

        if (!bio || bio.trim().length < 10) {
            newErrors.bio = "Bio must be atleast 10 characters long";
        }

        if (!skillsOffered || skillsOffered.split(",").filter(s => s.trim()).length === 0) {
            newErrors.skillsOffered = "Please enter atleast one skill you can offer";
        }

        if (!skillsWanted || skillsWanted.split(",").filter(s => s.trim()).length === 0) {
            newErrors.skillsWanted = "Please enter atleast one skill you want to learn";
        }

        if (!availability || !availability.trim()) {
            newErrors.availability = "Availability is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (isSubmitting) return;

        setMessage("");

        if (!validateProfile()) {
            return;
        }

        setIsSubmitting(true); // disable buttons


        try {

            await api.post("/profile", {
                user: user.id,
                bio,
                currentRole,
                education,
                experience,
                location: {
                    city,
                    country,
                },
                skillsOffered: skillsOffered.split(",").map(s => s.trim()),
                skillsWanted: skillsWanted.split(",").map(s => s.trim()),
                interests: interests.split(",").map(s => s.trim()),
                availability,
            });

            setMessage(profileExists ? "Profile updated successfully" : "Profile created successfully");
            setErrors({});

            setSavedProfile({
                bio,
                skillsOffered,
                skillsWanted,
                interests,
                availability,
                currentRole,
                education,
                experience,
                country,
                city,
            });

            setTimeout(() => {
                setMessage("");
            }, 5000);

            setProfileExists(true);
            setIsEditing(false);

        } catch (err) {
            setMessage(err.response?.data?.message || "Error saving profile");
        } finally {
            setIsSubmitting(false);  // re-enable buttons  
        }

    };

    if (loading) {
        return <p className="profile-page">Loading profile...</p>;
    }

    return (

        <div className="dashboard-layout">

            <div className="profile-page">

                <h2>My Profile</h2>

                {message && <p className="profile-message">{message}</p>}

                {/* View */}
                {profileExists && !isEditing && (
                    <div className="profile-card">

                        <div className="profile-row">
                            <span>Bio:</span>
                            <p>{bio || "-"}</p>
                        </div>

                        <div className="profile-row">
                            <span>Current Role:</span>
                            <p>{currentRole || "-"}</p>
                        </div>

                        <div className="profile-row">
                            <span>Education:</span>
                            <p>{education || "-"}</p>
                        </div>

                        <div className="profile-row">
                            <span>Experience:</span>
                            <p>{experience || "-"}</p>
                        </div>

                        <div className="profile-row">
                            <span>Location:</span>
                            <p>{city && country ? `${city}, ${country}` : "-"}</p>
                        </div>

                        <div className="profile-row">
                            <span>Skills Offered:</span>
                            <p>{skillsOffered || "-"}</p>
                        </div>

                        <div className="profile-row">
                            <span>Skills Wanted:</span>
                            <p>{skillsWanted || "-"}</p>
                        </div>

                        <div className="profile-row">
                            <span>Interests:</span>
                            <p>{interests || "-"}</p>
                        </div>

                        <div className="profile-row">
                            <span>Availability</span>
                            <p>{availability || "-"}</p>
                        </div>

                        <button onClick={() => setIsEditing(true)} className="primary-btn">
                            Update Profile
                        </button>

                    </div>
                )}

                {/* Create or Edit */}
                {isEditing && (

                    <form onSubmit={handleSubmit} className="profile-form">

                        <div className="form-group">
                            <label>Bio</label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)} />
                            {errors.bio && <p className="form-error">{errors.bio}</p>}
                        </div>

                        <div className="form-group">
                            <label>Skills Offered</label>
                            <input
                                type="text"
                                value={skillsOffered}
                                onChange={(e) => setSkillsOffered(e.target.value)}
                                placeholder="e.g. ML, Python"
                            />
                            {errors.skillsOffered && <p className="form-error">{errors.skillsOffered}</p>}
                        </div>

                        <div className="form-group">
                            <label>Skills Wanted</label>
                            <input
                                type="text"
                                value={skillsWanted}
                                onChange={(e) => setSkillsWanted(e.target.value)}
                                placeholder="e.g. AI, Data Science"
                            />
                            {errors.skillsWanted && <p className="form-error">{errors.skillsWanted}</p>}
                        </div>

                        <div className="form-group">
                            <label>Interests</label>
                            <input
                                type="text"
                                value={interests}
                                onChange={(e) => setInterests(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Current Role</label>
                            <input
                                type="text"
                                value={currentRole}
                                onChange={(e) => setCurrentRole(e.target.value)}
                                placeholder="e.g Frontend Developer"
                            />
                        </div>

                        <div className="form-group">
                            <label>Education</label>
                            <input
                                type="text"
                                value={education}
                                onChange={(e) => setEducation(e.target.value)}
                                placeholder="e.g IIT Bombay"
                            />
                        </div>

                        <div className="form-group">
                            <label>Experience</label>
                            <input
                                type="text"
                                value={experience}
                                onChange={(e) => setExperience(e.target.value)}
                                placeholder="e.g 2 years"
                            />
                        </div>

                        <div className="form-group">
                            <label>Location</label>
                            <div className="location-group">
                                <input
                                    type="text"
                                    placeholder="City"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                />

                                <input
                                    type="text"
                                    placeholder="Country"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Availability</label>
                            <input
                                type="text"
                                value={availability}
                                onChange={(e) => setAvailability(e.target.value)}
                                placeholder="e.g. Weekends, Evenings"
                            />
                            {errors.availability && <p className="form-error">{errors.availability}</p>}
                        </div>

                        <div className="profile-actions">
                            <button type="submit" disabled={isSubmitting} className="primary-btn">
                                {isSubmitting
                                    ? (profileExists ? "Updating..." : "Saving...")
                                    : (profileExists ? "Updating profile" : "Saving profile")}
                            </button>

                            {profileExists && (
                                <button
                                    type="button"
                                    className="secondary-btn"
                                    disabled={isSubmitting}
                                    onClick={() => {
                                        if (savedProfile) {
                                            setBio(savedProfile.bio);
                                            setSkillsOffered(savedProfile.skillsOffered);
                                            setSkillsWanted(savedProfile.skillsWanted);
                                            setInterests(savedProfile.interests);
                                            setAvailability(savedProfile.availability);
                                            setCurrentRole(savedProfile.currentRole);
                                            setEducation(savedProfile.education);
                                            setExperience(savedProfile.experience);
                                            setCity(savedProfile.city);
                                            setCountry(savedProfile.country);
                                        }

                                        setErrors({});
                                        setIsEditing(false);
                                    }}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>

                    </form>

                )}

            </div>
        </div>

    );

}

export default Profile;