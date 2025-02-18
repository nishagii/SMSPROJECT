import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Admin.css";

const Admin = () => {
    const [activeTab, setActiveTab] = useState("students");
    const [students, setStudents] = useState([]);
    const [mentors, setMentors] = useState([]);
    const [sliderPosition, setSliderPosition] = useState("0%");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await axios.get("http://localhost:5001/api/students");
                setStudents(response.data);
            } catch (error) {
                console.error("Error fetching students:", error);
            }
        };
        fetchStudents();
    }, []);

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const response = await axios.get("http://localhost:5001/api/mentors");
                setMentors(response.data);
            } catch (error) {
                console.error("Error fetching mentors:", error);
            }
        };
        fetchMentors();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch("http://localhost:5001/api/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSliderPosition(tab === "students" ? "0%" : "50%");
    };


    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2 className="admin-title">Admin Dashboard</h2>
                <Link
                    to="/login"
                    className="logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                </Link>
            </div>
            <div className="tabs-container">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === "students" ? "active" : ""}`}
                        onClick={() => handleTabChange("students")}
                    >
                        Students
                    </button>
                    <button
                        className={`tab ${activeTab === "mentors" ? "active" : ""}`}
                        onClick={() => handleTabChange("mentors")}
                    >
                        Mentors
                    </button>
                    <div
                        className="sliderr"
                        style={{
                            left: sliderPosition,
                            transition: "left 0.3s ease-in-out"
                        }}
                    />
                </div>
            </div>

            <div className="content-container">
                {activeTab === "students" && (
                    <div className="table-section">
                        <h3 className="section-title">Student List</h3>
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Year</th>
                                        <th>Department</th>
                                        <th>Mentor</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student) => (
                                        <tr key={student._id}>
                                            <td>{student.sid}</td>
                                            <td>{student.sname}</td>
                                            <td>{student.mail}</td>
                                            <td>{student.year}</td>
                                            <td>{student.dept}</td>
                                            <td>{student.mentor}</td>
                                            <td className="actions-cell">
                                                <Link to={`/admin-edit-student/${student._id}`} className="update-btn">Update</Link>
                                                <Link to="#" className="delete-btn">Delete</Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {activeTab === "mentors" && (
                    <div className="table-section">
                        <h3 className="section-title">Mentor List</h3>
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Department</th>
                                        <th>Phone</th>
                                        <th>Expertise</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mentors.map((mentor) => (
                                        <tr key={mentor._id}>
                                            <td>{mentor.name}</td>
                                            <td>{mentor.mail}</td>
                                            <td>{mentor.dept}</td>
                                            <td>{mentor.phone}</td>
                                            <td>{mentor.expertise}</td>
                                            <td className="actions-cell">
                                                <Link to={`/admin-edit-mentor/${mentor._id}`} className="update-btn">Update</Link>
                                                <Link to="#" className="delete-btn">Delete</Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
