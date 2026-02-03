import { useState } from "react";
import { NavLink, useNavigate, Link } from "react-router";
import './Header.css'

export function Header() {
    const [showDropdown, setShowDropdown] = useState(false);


    const userName = localStorage.getItem('user-name');
    const navigateToLoginPage = useNavigate();
    const navigate = useNavigate();

    const isSuperUser = JSON.parse(localStorage.getItem('is_superuser'));

    const toggleLogout = () => {
        localStorage.removeItem('access');
        navigateToLoginPage('/');
        console.log(isSuperUser);
    };

    const navigateToViewAgents = (e) => {
        e.preventDefault();
        navigate('/homepage/viewagents');
    };

    return (
        <header className="navbar">
            <Link style={{ textDecoration: "none", color: "inherit" }} to="/homepage"><div className="logo">Zahoor Travels</div></Link>

            {
                isSuperUser &&
                (<nav className="nav-links">
                    <NavLink onClick={navigateToViewAgents} className="nav-link">
                        View Agents
                    </NavLink>
                </nav>)
            }

            <div className="user-menu" onClick={() => setShowDropdown(!showDropdown)}>
                <span className="username">{userName}</span>
                <svg
                    className={`dropdown-icon ${showDropdown ? 'rotated' : ''}`}
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                >
                    <path
                        d="M4 6L8 10L12 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>

                {showDropdown && (
                    <div className="dropdown">
                        <a href="#logout" onClick={toggleLogout}>Logout</a>
                    </div>
                )}
            </div>
        </header>
    );
}