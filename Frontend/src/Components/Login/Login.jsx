import React, { useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const Login = () => {
    const [mail, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("");
    const [error, setError] = useState({ email: "", pass: "" }); // State for error messages
    const [isLoading, setIsLoading] = useState(false); // Loading state for UX
    const [passwordVisible, setPasswordVisible] = useState(false);
    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setError({ email: "", pass: "" });

        if (name === "mail") {
            setEmail(value);

            let atPosition = value.indexOf("@");
            let dotPosition = value.indexOf(".", atPosition);
            const mailCheck = value.substring(atPosition + 1, dotPosition);

            // let findRole = ["ict", "at", "et", "iat"].includes(mailCheck)
            //     ? "Mentor"
            //     : "Student";

            let findRole =
                mailCheck === "admin"
                    ? "Admin"
                    : ["ict", "at", "et", "iat"].includes(mailCheck)
                    ? "Mentor"
                    : "Student";

            setRole(findRole);
        } else if (name === "pass") {
            setPassword(value);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Start loading state
        setError(""); // Clear previous errors

        try {
            const result = await axios.post(
                "http://localhost:5001/api/login",
                { mail, password, role },
                { withCredentials: true }
            );

            console.log(result.data);
            if (result.data.success) {
                setError({ email: "", pass: "" });
                if (role === "Mentor") {
                    navigate("/mentor-dashboard");
                } else if (role === "Student") {
                    navigate("/student-dashboard");
                } else if (role === "Admin") {
                    navigate("/admin-dashboard");
                }
            }
        } catch (err) {
            if (err.response) {
                const errorMessage = err.response.data.message; // Get the error message from the response

                if (errorMessage.includes("Email not found")) {
                    setError((prevState) => ({
                        ...prevState,
                        email: errorMessage,
                    }));
                } else if (errorMessage.includes("Password not matched")) {
                    setError((prevState) => ({
                        ...prevState,
                        pass: errorMessage,
                    }));
                } else {
                    console.error(err);
                    toast.error(
                        "Error occurred while logging in. Please try again later."
                    );
                }
            } else {
                console.error(err);
                toast.error(
                    "Error occurred while logging in. Please try again later."
                );
            }
        } finally {
            setIsLoading(false); // Stop loading state
        }
    };

    return (
        <div className="cont">
            <form action="" onSubmit={handleLogin}>
                <h2>Login</h2>
                <Link className="xbtn" to="/">
                    <i className="fa-solid fa-xmark"></i>
                </Link>

                <div className="input-wrapper">
                    <label htmlFor="email">Email</label>
                    <i className="fa-solid fa-user"></i>
                    <input
                        onChange={handleChange}
                        value={mail}
                        type="email"
                        id="email"
                        className={error.email ? "error-state" : ""}
                        required
                        name="mail"
                        autoFocus
                    />
                </div>

                <span className="error" style={{ height: "1rem" }}>
                    {error.email}
                </span>

                <div className="input-wrapper">
                    <label htmlFor="password">Password</label>
                    <i className="fa-solid fa-lock"></i>

                    <div className="eye-wrapper">
                        <span
                            className="icon"
                            onClick={togglePasswordVisibility}
                        >
                            <i
                                className={`fa-solid ${
                                    passwordVisible ? "fa-eye-slash" : "fa-eye"
                                }`}
                            ></i>
                        </span>
                    </div>

                    <input
                        onChange={handleChange}
                        value={password}
                        type={passwordVisible ? "text" : "password"}
                        id="password"
                        className={error.pass ? "error-state" : ""}
                        required
                        name="pass"
                    />
                </div>

                <span className="error" style={{ height: "1rem" }}>
                    {error.pass}
                </span>
                <Link to="/forgot-password" className="forgot">
                    <h4>Forgot Password?</h4>
                </Link>
                <div className="btn-center">
                    <button
                        type="submit"
                        disabled={isLoading}
                        id={isLoading ? "loading" : ""}
                    >
                        {isLoading ? "Logging-in..." : "Login"}
                    </button>
                    <h4>
                        Don't Have An Account?
                        <Link to="/role" className="link">
                            Sign Up
                        </Link>
                    </h4>
                </div>
            </form>
            <ToastContainer />
        </div>
    );
};

export default Login;
