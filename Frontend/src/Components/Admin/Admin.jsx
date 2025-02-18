import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
                                            <Link
                                                to={`/admin-edit-student/${student._id}`}
                                                className="text-blue-500 hover:underline"
                                            >
                                                Update
                                            </Link>{" "}
                                            |
                                            {/* <Link
                                                to={``}
                                                onClick={async () => {
                                                    if (
                                                        window.confirm(
                                                            "Are you sure you want to delete this student?"
                                                        )
                                                    ) {
                                                        try {
                                                            await axios.delete(
                                                                `http://localhost:5001/api/delete-students/${student._id}`
                                                            );
                                                            const response =
                                                                await axios.get(
                                                                    "http://localhost:5001/api/students"
                                                                );
                                                            setStudents(
                                                                response.data
                                                            );
                                                        } catch (error) {
                                                            console.error(
                                                                "Error deleting student:",
                                                                error
                                                            );
                                                            alert(
                                                                "Failed to delete student."
                                                            );
                                                        }
                                                    }
                                                }}
                                                className="text-red-500 hover:underline ml-2"
                                            >
                                                Delete
                                            </Link> */}
                                            <Link
                                                to={``}
                                                onClick={async () => {
                                                    if (
                                                        window.confirm(
                                                            "Are you sure you want to delete this student?"
                                                        )
                                                    ) {
                                                        try {
                                                            await axios.delete(
                                                                `http://localhost:5001/api/delete-students/${student._id}`
                                                            );
                                                            const response =
                                                                await axios.get(
                                                                    "http://localhost:5001/api/students"
                                                                );
                                                            setStudents(
                                                                response.data
                                                            );
                                                        } catch (error) {
                                                            console.error(
                                                                "Error deleting student:",
                                                                error
                                                            );
                                                        }
                                                    }
                                                }}
                                                className="text-red-500 hover:underline ml-2"
                                            >
                                                Delete
                                            </Link>
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
                                            <Link
                                                to={`/admin-edit-mentor/${mentor._id}`}
                                                className="text-blue-500 hover:underline"
                                            >
                                                Update
                                            </Link>{" "}
                                            <Link
                                                to={``}
                                                onClick={async () => {
                                                    if (
                                                        window.confirm(
                                                            "Are you sure you want to delete this mentor?"
                                                        )
                                                    ) {
                                                        try {
                                                            await axios.delete(
                                                                `http://localhost:5001/api/delete-mentor/${mentor._id}`
                                                            );
                                                            // Refresh mentor list
                                                            const response =
                                                                await axios.get(
                                                                    "http://localhost:5001/api/mentors"
                                                                );
                                                            setMentors(
                                                                response.data
                                                            );
                                                        } catch (error) {
                                                            console.error(
                                                                "Error deleting mentor:",
                                                                error
                                                            );
                                                        }
                                                    }
                                                }}
                                                className="text-red-500 hover:underline ml-2"
                                            >
                                                Delete
                                            </Link>
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
