import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Admin.css";
const Admin = () => {
    const [activeTab, setActiveTab] = useState("students");
    const [students, setStudents] = useState([]);
    const [mentors, setMentors] = useState([]);

    const handleUpdate = (id) => {
        console.log(
            `Update ${
                activeTab === "students" ? "student" : "mentor"
            } with id:`,
            id
        );
    };
    const handleDelete = (id) => {
        console.log(
            `Delete ${
                activeTab === "students" ? "student" : "mentor"
            } with id:`,
            id
        );
    };

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:5001/api/students"
                );
                setStudents(response.data);
                console.log(response.data);
            } catch (error) {
                console.error("Error fetching students:", error);
            }
        };
        fetchStudents();
    }, []);

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:5001/api/mentors"
                );
                setMentors(response.data);
            } catch (error) {
                console.error("Error fetching students:", error);
            }
        };
        fetchMentors();
    }, []);

    return (
        <div className="admin-container">
            <h2 className="admin-title">Admin Dashboard</h2>
            <div className="tabs-container">
                <div className="tabs">
                    <button
                        className={`tab ${
                            activeTab === "students" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("students")}
                    >
                        Students
                    </button>
                    <button
                        className={`tab ${
                            activeTab === "mentors" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("mentors")}
                    >
                        Mentors
                    </button>
                    <div
                        className="slider"
                        style={{
                            transform: `translateX(${
                                activeTab === "students" ? "0" : "100"
                            }%)`,
                        }}
                    />
                </div>
            </div>
            <div className="content-container">
                {activeTab === "students" && (
                    <div className="table-section">
                        <h3 className="section-title">Student List</h3>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>year</th>
                                    <th>department</th>
                                    <th>mentor</th>
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
                                            <button
                                                className="action-btn update-btn"
                                                onClick={() =>
                                                    handleUpdate(student.id)
                                                }
                                            >
                                                Update
                                            </button>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() =>
                                                    handleDelete(student.id)
                                                }
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {activeTab === "mentors" && (
                    <div className="table-section">
                        <h3 className="section-title">Mentor List</h3>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Phone</th>
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
                                            <button
                                                className="action-btn update-btn"
                                                onClick={() =>
                                                    handleUpdate(mentor.id)
                                                }
                                            >
                                                Update
                                            </button>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() =>
                                                    handleDelete(mentor.id)
                                                }
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
export default Admin;
