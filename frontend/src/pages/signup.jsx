import { useState } from "react";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import "./auth.css";

function Signup() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        try {

            await api.post("/auth/register", {
                name,
                email,
                password,
            });

            setSuccess("Account created successfully. Please Login.");

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (err) {
            setError(err.response?.data?.message || "Signup failed");
        }
    };

    return (

        <div className="auth-page">

            <div className="auth-brand">
                <h1>
                    Mentor<span className="brand-x">X</span>change
                </h1>
                <p className="auth-tagline">
                    Teach what you know. Learn what you want.
                </p>
            </div>

            <div className="auth-card">

                <h2>Signup</h2>

                {error && <div className="auth-error">{error}</div>}
                {success && <div className="auth-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    
                    <div className="auth-group">
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="auth-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button className="auth-btn" type="submit">
                        Signup
                    </button>

                </form>

                <div className="auth-footer">
                    Already have an account?
                    <Link to="/login"> Login </Link>
                </div>
            </div>

        </div>

    );

}

export default Signup;