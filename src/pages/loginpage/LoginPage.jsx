import axios from 'axios';
import { useState } from 'react';
import './LoginPage.css'
import { useNavigate } from 'react-router';

export function LoginPage() {
    const [userName, setUserName] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const toggleUserNameInput = (event) => {
        setUserName(event.target.value);
    };

    const toggleuserPasswordInput = (event) => {
        setUserPassword(event.target.value);
    };

    const fetchJWTToken = async () => {
        try {
            setLoading(true);

            const response = await axios.post('https://yousef-frizzliest-myah.ngrok-free.dev/login/', {
                username: userName,
                password: userPassword
            }, {
                headers: {
                    "Content-Type": "application/json",
                    'ngrok-skip-browser-warning': 'true',
                }
            });

            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);
            localStorage.setItem("is_staff", response.data.is_staff);
            localStorage.setItem("is_superuser", response.data.is_superuser);
            localStorage.setItem("user-name", userName);
            localStorage.setItem("password", userPassword);

            setTimeout(() => {
                navigate('/homepage');
            }, 200);

        } catch (error) {
            alert("Invalid username or password");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSignInButton = async (event) => {
        event.preventDefault();
        if (userName === '' && userPassword === '') {
            alert('UserName and Password fields are empty');
            return;
        }
        else if (userName === '') {
            alert('UserName field is empty');
            return;
        }
        else if (userPassword === '') {
            alert('Password field is empty');
            return;
        }
        else {
            await fetchJWTToken();
        }
    };

    return (
        <div className="login-wrapper">
            <div className="signin-container">
                <div className="lock-icon"></div>
                <h1>Sign in</h1>

                <form id="signinForm">
                    <div className="form-group">
                        <label htmlFor="username">User Name <span className="required">*</span></label>
                        <input type="text" id="username" name="username" onChange={toggleUserNameInput} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password <span className="required">*</span></label>
                        <input type="password" id="password" name="password" onChange={toggleuserPasswordInput} required />
                    </div>

                    <button
                        type="submit"
                        className="signin-button"
                        onClick={toggleSignInButton}
                        disabled={loading}
                    >
                        {loading ? <span className="spinner"></span> : "SIGN IN"}
                    </button>
                </form>
            </div>
        </div>
    );
}