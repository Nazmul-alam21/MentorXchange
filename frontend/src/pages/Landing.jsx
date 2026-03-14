import {useNavigate} from "react-router-dom";
import "../styles/landing.css";
import illustration from "../assets/landing-illustration.png";

function Landing() {

    const navigate = useNavigate();

    return (

        <div className="landing-page">

            {/* Top Logo */}
            <header className="landing-header">
                <h1 className="landing-logo">
                    <span className="logo-mentor">Mentor</span>
                    <span className="logo-x">X</span>
                    <span className="logo-change">change</span>
                </h1>
            </header>

            {/* Heor Section */}
            <main className="landing-hero">
                <div className="hero-left">
                    <h2 className="hero-title">
                        Learn what you want. Teach what you know.
                    </h2>

                    <p className="hero-subtitle">
                        MentorXchange is a skill-exchange platform where you learn directly
                        from people and share your own skills in return - no money involved.
                    </p>

                    <ul className="hero-features">
                        <li>
                            <span className="dot"></span>
                            Exchange skills instead of paying money
                        </li>
                        <li>
                            <span className="dot"></span>
                            Learn and teach through real 1-on-1 conversations
                        </li>
                        <li>
                            <span className="dot"></span>
                            Grow together by sharing knowledge
                        </li>
                    </ul>

                    <button
                    className="hero-cta"
                    onClick={() => navigate("/login")}
                    >
                        Get Started
                    </button>
                </div>

                <div className="hero-right">
                    <img 
                    src={illustration} 
                    alt="Growth and connection illustration"
                    className="hero-illustration" 
                    />
                </div>
            </main>

        </div>

    );

}

export default Landing;