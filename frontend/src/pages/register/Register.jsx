/* React page for registering a new account */
import { useState } from "react";
import "./register.scss";
import logo from "../../components/titan-clear-logo.png";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useRef } from "react";
import RegexUtil from "../../utils/regex-util";
import ROUTES from "../../routes";

/**
 * Returns a react component consisting of the Register page. Includes all logic relevant to registering.
 * 
 * @returns a react component consisting of the Register page.
 */
export default function Register() {
    /* Mapping of different error messages. */
    const ERROR_MESSAGES = {
        EXISTING_CREDENTIALS_ERROR: "Email, phone number, or username already taken.",
        INVALID_EMAIL_ERROR: "Invalid email format.",
        INVALID_PHONE_ERROR: "Invalid phone format.",
        INVALID_USERNAME_ERROR: "Invalid username. Username cannot contain spaces and minimum length must be at least ",
        INVALID_PASSWORD_ERROR: "Invalid password. The length must be at least ",
        GENERIC_SERVER_ERROR: "There was a problem registering your account. Please try again later."
    }

    /* Used to navigate to different pages. */
    const navigate = useNavigate();

    /* States for user credentials. */
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");

    /* State for whether credentials entered are valid. */
    const [isValidCredentials, setIsValidCredentials] = useState(true);

    /* Flag for whether use clicked on 'Get Started' after entering their email. */
    const [clickedGetStarted, setclickedGetStarted] = useState(false);

    /* The current error message to be displayed to the user */
    const [errorMessage, setErrorMessage] = useState(ERROR_MESSAGES.EXISTING_CREDENTIALS_ERROR);

    /* Reference to the DOM element where user enters their email */
    const emailRef = useRef();

    /* Returns true if the email box is already filled */
    function isEmailBoxFilled() {
        return emailRef.current.value.length > 0;
    }

    /* Handles when user hits 'Enter' key after typing email */
    const handleGetStarted = (e) => {
        /* If all the fields are displayed, try submitting the form */
        if (clickedGetStarted) {
            handleRegister(e);
            return;
        }

        /* If email box is filled, show other fields */
        if (isEmailBoxFilled()) {
            setclickedGetStarted(true);
        }
    }

    /* Handles registration logic when user clicks 'Sign Up' or hits 'Enter' on the keyboard. */
    const handleRegister = (e) => {
        /* prevent default event behavior or else registering won't work when clicked */
        e.preventDefault(); 

        /* Reset all error flags when attempting register */
        setIsValidCredentials(true);

        /* Check if email is valid */
        if (!RegexUtil.isValidEmailFormat(email)) {
            setIsValidCredentials(false);
            setErrorMessage(ERROR_MESSAGES.INVALID_EMAIL_ERROR);
            return;
        }

        /* Check if phone is valid */
        if (!RegexUtil.isValidPhoneFormat(phone)) {
            setIsValidCredentials(false);
            setErrorMessage(ERROR_MESSAGES.INVALID_PHONE_ERROR);
            return;
        }

        /* Check if username is valid */
        if (!RegexUtil.isValidUsernameFormat(username)) {
            setIsValidCredentials(false);
            setErrorMessage(ERROR_MESSAGES.INVALID_USERNAME_ERROR + RegexUtil.MIN_USERNAME_LENGTH + ".");
            return;
        }

        /* Check if password is valid */
        if (!RegexUtil.isValidPasswordFormat(password)) {
            setIsValidCredentials(false);
            setErrorMessage(ERROR_MESSAGES.INVALID_PASSWORD_ERROR + RegexUtil.MIN_PASSWORD_LENGTH + ".");
            return;
        }      
        
        /* Perform HTTP request to register user */
        performRegister();
    }

    /* Performs the HTTP Request to the backend to register the user. */
    const performRegister = async () => {
        try {
            /* Perform POST request to register user */
            await axios.post("auth/register", {
                username: username,
                email: email,
                phone: phone,
                password: password
            });

            /* Navigate to login page after successful registration */
            navigate(ROUTES.LOGIN, {
                state: {
                    justRegistered: true
                }
            });
        } catch (err) {
            if (err.response && err.response.status === 403) {
                setErrorMessage(ERROR_MESSAGES.EXISTING_CREDENTIALS_ERROR);
            } else {
                setErrorMessage(ERROR_MESSAGES.GENERIC_SERVER_ERROR);
            }
            setIsValidCredentials(false);
        }
    }

    /* Return react component */
    return (
        <div className="register">
            <div className="top">
                <div className="wrapper">
                    <img
                        className="logo"
                        src={logo}
                        alt=""
                    />
                    <Link to="/login" className="link">
                        <button className="loginButton">
                            Sign In
                        </button>
                    </Link>
                </div>
            </div>
            <div className="container">
                <h1>Ready to level up your fitness and nutrition journey?</h1>
                <h2>Sign up for free.</h2>
                <p>
                    Ready to reach your health goals? Create your account below.
                </p>

                <div className="input">
                    <input
                        type="email"
                        placeholder="email"
                        onChange={(e) => {
                            setEmail(
                                e.target.value
                            )
                        }}
                        ref={emailRef}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleGetStarted(e);
                            }
                        }}
                    />
                    {!clickedGetStarted && ( // hide this button when user clicks on next
                        <button
                            className="registerButton"
                            onClick={handleGetStarted}
                        >Get Started</button>
                    )}
                </div>

                {/* only display after using clicks get started */}
                <div className="input"
                 style={{ visibility: !clickedGetStarted && "hidden" }}
                 >
                    <input
                        type="phone number"
                        placeholder="phone number"
                        onChange={(e) => {
                            setPhone(
                                e.target.value
                            )
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleGetStarted(e)}
                    />
                    <button onClick={handleRegister} style={{ visibility: "hidden" }}>Sign Up</button>
                </div>

                { // only display username, phone number, and password forms when user clicks next after entering valid email
                    <form
                        className="input"
                        style={{ visibility: !clickedGetStarted && "hidden" }}
                    >
                        <input
                            type="username"
                            placeholder="username"
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button className="registerButton" onClick={handleRegister}>Sign Up</button>
                    </form>
                }

                { // error message if user enters invalid email regex or credentials already taken
                    <div className="errorMessage">
                        <p style={{ visibility: (isValidCredentials) && "hidden" }}>
                            {errorMessage}
                        </p>
                    </div>
                }
            </div>
        </div>
    )
}
