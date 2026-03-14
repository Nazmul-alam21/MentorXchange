import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import "./profileView.css";

function ProfileView() {

    const { userId } = useParams();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {

            try {

                const res = await api.get(`/profile/${userId}`);
                setProfile(res.data);

            } catch (err) {
                console.error("Error loading profile", err);
            } finally {
                setLoading(false);
            }

        };

        fetchProfile();
    }, [userId])

    if (loading) {
        return <p style={{ padding: "20px" }}>Loading profile...</p>;
    }

    if (!profile || !profile.user) {
        return <p style={{ padding: "20px" }}>Profile not found</p>;
    }

    return (

        <div className="dashboard-layout">

            <div className="profile-view-page">

                <div className="profile-view-header">

                    <h2>{profile.user.name}</h2>

                </div>

                <div className="profile-view-card">

                    <div className="profile-view-row">
                        <span>Bio:</span>
                        <p>{profile.bio || "-"}</p>
                    </div>

                    <div className="profile-view-row">
                        <span>Current Role:</span>
                        <p>{profile.currentRole || "-"}</p>
                    </div>

                    <div className="profile-view-row">
                        <span>Education:</span>
                        <p>{profile.education || "-"}</p>
                    </div>

                    <div className="profile-view-row">
                        <span>Experience:</span>
                        <p>{profile.experience || "-"}</p>
                    </div>

                    <div className="profile-view-row">
                        <span>Location:</span>
                        <p>
                            {profile.location?.city && profile.location?.country
                                ? `${profile.location.city}, ${profile.location.country}`
                                : "-"}
                        </p>
                    </div>

                    <div className="profile-view-row">
                        <span>Skills Offered:</span>
                        <p>{profile.skillsOffered.join(", ") || "-"}</p>
                    </div>

                    <div className="profile-view-row">
                        <span>Skills Wanted:</span>
                        <p>{profile.skillsWanted.join(", ") || "-"}</p>
                    </div>

                    <div className="profile-view-row">
                        <span>Interests:</span>
                        <p>{profile.interests.join(",") || "-"}</p>
                    </div>

                    <div className="profile-view-row">
                        <span>Availability:</span>
                        <p>{profile.availability || ("-")}</p>
                    </div>
                </div>
            </div>
        </div>

    );

}

export default ProfileView;