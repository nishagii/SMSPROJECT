import React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminEditMentor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [mentor, setMentor] = useState({
        name: "",
        mail: "",
        phone: "",
        dept: "",
    });

    useEffect(() => {
        const fetchMentor = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5001/api/mentor/${id}`
                );
                setMentor(response.data);
            } catch (error) {
                console.error("Error fetching Mentor:", error);
            }
        };
        fetchMentor();
    }, [id]);

    const handleChange = (e) => {
        setMentor({ ...mentor, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(
                `http://localhost:5001/api/edit-mentor/${id}`,
                mentor
            );
            toast.success("Mentor updated successfully!");
            alert("Mentor updated successfully!");
            navigate("/admin-dashboard");
        } catch (error) {
            toast.error("Error updating Mentor");
            console.error("Error updating Mentor:", error);
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Edit Mentor
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Name</label>
                        <input
                            type="text"
                            name="sname"
                            value={mentor.name}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            name="mail"
                            value={mentor.mail}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg"
                            required
                            readOnly
                            disabled
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Year</label>
                        <input
                            type="text"
                            name="phone"
                            value={mentor.phone}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">
                            Department
                        </label>
                        <input
                            type="text"
                            name="dept"
                            value={mentor.dept}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg"
                            required
                        />
                    </div>
                    {/* <div className="mb-4">
                        <label className="block text-gray-700">Mentor</label>
                        <input
                            type="text"
                            name="mentor"
                            value={mentor.mentor}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-lg"
                        />
                    </div> */}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-lg"
                    >
                        Update Mentor
                    </button>
                </form>
            </div>
        </>
    );
};

export default AdminEditMentor;
