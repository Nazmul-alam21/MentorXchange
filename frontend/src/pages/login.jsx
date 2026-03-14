import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import "./auth.css";


function Login() {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();


    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {

            const res = await api.post("/auth/login", {
                email,
                password,
            });


            // assuming backend sends {user, token};

            login(res.data.user, res.data.token);

            navigate("/dashboard");

        } catch (err) {

            setError(err.response?.data?.message || "Invalid email or password");

        }
    };


    return (

        <div className="auth-page">

            <div className="auth-brand">
                <h1>
                    Mentor<span className="brand-x">X</span>change
                </h1>
                <p className="auth-tagline">
                    Learn what you want. Teach what you know.
                </p>
            </div>

            <div className="auth-card">

                <h2>Login</h2>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit}>

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
                        Login
                    </button>

                </form>

                <div className="auth-footer">
                    Don&apos;t have an account?
                    <Link to="/signup"> Signup </Link>
                </div>
            </div>

        </div>

    );

}

export default Login;