import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/Navbar.css";
import { toast } from "react-toastify";

const Navbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            try {
                const token = localStorage.getItem("token");
                const sessionId = localStorage.getItem("sessionId");
                const handleSessionInvalid = () => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("sessionId");
                    setIsLoggedIn(false);
                    toast.error("Session expired. Please log in again.", { position: "top-right" });
                    navigate("/login");
                };

                if (token && sessionId) {
                    const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/session-validate`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        withCredentials: true,
                    });

                    if (response.data.success) {
                        setIsLoggedIn(true);
                    } else {
                        console.warn("Session validation failed. Redirecting to login.");
                        handleSessionInvalid();
                    }
                } else {
                    console.warn("Missing token or session ID. Redirecting to login.");
                    handleSessionInvalid();
                }
            } catch (error) {
                console.error("Session validation failed:", error.message);
                localStorage.removeItem("token");
                localStorage.removeItem("sessionId");
                setIsLoggedIn(false);

                toast.error("Session expired. Please log in again.", { position: "top-right" });
            }
        };

        checkSession();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.scrollY > 0);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const menuToggle = () => {
        const menuToggle = document.querySelector(".menuToggle");
        const navigation = document.querySelector(".navigation");

        menuToggle.classList.toggle("active");
        navigation.classList.toggle("active");
    };

    const handleLogout = async (notifyBackend = true) => {
        try {
            if (notifyBackend) {
                const token = localStorage.getItem("token");
                const sessionId = localStorage.getItem("sessionId");

                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/user/api/logout`,
                    { sessionId },
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        withCredentials: true,
                    }
                );

                if (!response.data.success) {
                    toast.error("Failed to log out. Please try again.", { position: "top-right" });
                    return;
                }
            }
            localStorage.removeItem("token");
            localStorage.removeItem("sessionId");
            setIsLoggedIn(false);
            toast.success("Logged out successfully!", { position: "top-right" });
            navigate("/login");
        } catch (error) {
            console.error("Error during logout:", error.message);
            toast.error("Failed to log out. Please try again.", { position: "top-right" });
        }
    };

    return (
        <header className={isSticky ? "sticky" : ""}>
            <Link to="/" className="logo">
                <img src={isSticky ? 'src/assets/Mishaps-Black.svg' : 'src/assets/Mishaps-White.svg'} alt="logo" />
            </Link>
            <div className="menuToggle" onClick={menuToggle}></div>
            <nav>
                <ul className="navigation">
                    <li><a href="/home">Home</a></li>
                    <li><a href="#about">About Us</a></li>
                    <li><a href="#komun">Our Activities</a></li>
                    <li><a href="#testimonials">Their Comments</a></li>
                    {isLoggedIn ? (
                        <>
                            <li><Link to="/account">Manage Account</Link></li>
                            <li>
                                <button className="logout-button" onClick={handleLogout}>
                                    Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <li><Link to="/register"><b>Join Us</b></Link></li>
                    )}
                </ul>
            </nav>
        </header>
    );
};

export default Navbar;