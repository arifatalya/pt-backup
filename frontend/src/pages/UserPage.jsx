import React, { useState, useEffect } from "react";
import "../styles/UserPage.css";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/Navbar.jsx";

const UserPage = () => {
    const [userData, setUserData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/user/api/account`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        withCredentials: true,
                    }
                );
                if (response.data.success) {
                    setUserData({
                        username: response.data.user.username,
                        email: response.data.user.email,
                        password: "", // Password is not retrieved for security reasons
                    });
                } else {
                    toast.error("Failed to load user data.", { position: "top-right" });
                }
            } catch (error) {
                console.error("Error fetching user data:", error.message);
                toast.error("Error fetching user data.", { position: "top-right" });
            }
        };
        fetchUserData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        // Validate input
        if (!userData.username || !userData.email) {
            toast.error("Username and email are required.", { position: "top-right" });
            return;
        }
        if (userData.password && userData.password.length < 8) {
            toast.error("Password must be at least 8 characters.", { position: "top-right" });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const updateData = {
                username: userData.username,
                email: userData.email,
            };

            // Include password only if it is updated
            if (userData.password) {
                updateData.password = userData.password;
            }

            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/user/api/update`,
                updateData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                }
            );

            if (response.data.success) {
                toast.success("Account updated successfully.", { position: "top-right" });
                setEditMode(false);
                setUserData({ ...userData, password: "" }); // Clear the password field
            } else {
                toast.error(response.data.message || "Failed to update account.", {
                    position: "top-right",
                });
            }
        } catch (error) {
            console.error("Error updating user:", error.message);
            toast.error("Error updating user.", { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        const password = window.prompt("Please enter your password to confirm account deletion:");

        if (!password) {
            toast.error("Password is required to delete the account.", { position: "top-right" });
            return;
        }

        if (window.confirm("Are you sure you want to delete your account? 😿")) {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.delete(
                    `${import.meta.env.VITE_API_URL}/user/api/delete`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        data: { password },
                        withCredentials: true,
                    }
                );
                if (response.data.success) {
                    toast.success("Account deleted successfully.", {
                        position: "top-right",
                    });
                    localStorage.clear(); // Clear user session
                    window.location.href = "/register";
                } else {
                    toast.error(response.data.message || "Failed to delete account.", {
                        position: "top-right",
                    });
                }
            } catch (error) {
                console.error("Error deleting user:", error.message);
                toast.error("Error deleting account.", { position: "top-right" });
            }
        }
    };

    return (
        <div className="user-page-container">
            <Navbar />
                <div className="user-page">
                    <ToastContainer />
                    <h1>Your Account</h1>
                    <form className="user-form" onSubmit={handleUpdate}>
                        <div className="user-form-group">
                            <label>Username</label>
                            <input type="text" name="username" value={userData.username} placeholder=" "
                                   onChange={handleChange} disabled={!editMode} required/>
                        </div>

                        <div className="user-form-group">
                            <label>Email</label>
                            <input type="email" name="email" value={userData.email} placeholder=" "
                                   onChange={handleChange} disabled={!editMode} required/>
                        </div>

                        <div className="user-form-group">
                            <label>Password</label>
                            <input type="password" name="password" value={userData.password} placeholder=" "
                                   onChange={handleChange} disabled={!editMode}/>
                        </div>
                        {editMode ? (
                                <>
                                    <button type="submit"
                                            disabled={loading}>{loading ? "Updating..." : "Save Changes"}</button>
                                    <button type="button" onClick={() => setEditMode(false)}>Cancel</button>
                                </>
                            ) : (
                                <button onClick={() => setEditMode(true)} disabled={loading}>
                                    {loading ? "Please wait..." : "Edit Account"}
                                </button>
                            )}
                    </form>
                    <button className="delete-account" onClick={handleDelete}>
                        Delete Account
                    </button>
                </div>
        </div>
    );
};

export default UserPage;
