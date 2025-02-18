import React, { useState } from "react";
import "./Admin.css";
const Admin = () => {
    const [activeTab, setActiveTab] = useState("students");
    const students = [
        { id: 1, name: "Alice Johnson", email: "alice@example.com" },
        { id: 2, name: "Bob Smith", email: "bob@example.com" },
    ];
    const mentors = [
        { id: 1, name: "Dr. Emily Brown", expertise: "Computer Science" },
        { id: 2, name: "Mr. James Wilson", expertise: "Data Science" },
    ];
    const handleUpdate = (id) => {
        console.log(`Update ${activeTab === "students" ? "student" : "mentor"} with id:`, id);
    };
    const handleDelete = (id) => {
        console.log(`Delete ${activeTab === "students" ? "student" : "mentor"} with id:`, id);
    };
    return (
        <div className="admin-container">
            <h2 className="admin-title">Admin Dashboard</h2>
            <div className="tabs-container">
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === "students" ? "active" : ""}`}
                        onClick={() => setActiveTab("students")}
                    >
                        Students
                    </button>
                    <button
                        className={`tab ${activeTab === "mentors" ? "active" : ""}`}
                        onClick={() => setActiveTab("mentors")}
                    >
                        Mentors
                    </button>
                    <div
                        className="slider"
                        style={{
                            transform: `translateX(${activeTab === "students" ? "0" : "100"}%)`
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
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student.id}>
                                        <td>{student.id}</td>
                                        <td>{student.name}</td>
                                        <td>{student.email}</td>
                                        <td className="actions-cell">
                                            <button
                                                className="action-btn update-btn"
                                                onClick={() => handleUpdate(student.id)}
                                            >
                                                Update
                                            </button>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() => handleDelete(student.id)}
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
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Expertise</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mentors.map((mentor) => (
                                    <tr key={mentor.id}>
                                        <td>{mentor.id}</td>
                                        <td>{mentor.name}</td>
                                        <td>{mentor.expertise}</td>
                                        <td className="actions-cell">
                                            <button
                                                className="action-btn update-btn"
                                                onClick={() => handleUpdate(mentor.id)}
                                            >
                                                Update
                                            </button>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() => handleDelete(mentor.id)}
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