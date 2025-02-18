import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./Feedback.css";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Feedback = () => {
  const [mentorName, setMentorName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const navigate = useNavigate(); // Initialize navigate function

  useEffect(() => {
    const now = new Date();
    setDate(now.toISOString().split("T")[0]); // Format: YYYY-MM-DD
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try{
      const response = await axios.post('http://localhost:5001/api/feedback',
                      { mentorName,description,date }
                    );
      if(response.data.success){
        toast.success('Feedback submitted anonymously!');
        setMentorName('');
        setDescription('');
      }
                  
    }catch(error){
      toast.error('Error: There was an issue submitting your feedback! ');
      console.log('Error submitting feedback:', error);
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

   return (
    <div>
      {/* <button type="button" className="xbtn" onClick={() => navigate(-1)}> */}
            
      
        <div className="feedback-cont">
        <form onSubmit={handleSubmit} className="feedback-form">
        <i className="fa-solid fa-xmark xbutton" onClick={handleClose}></i>
          <h2>Feedback Form</h2>

          <label htmlFor="mentor">Mentor Name</label>
          <input
            id="mentor"
            type="text"
            value={mentorName}
            onChange={(e) => setMentorName(e.target.value)}
            placeholder="Enter mentor's name"
            required
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter feedback description"
            required
          ></textarea>

          <label htmlFor="date">Today Date</label>
          <input id="date" type="text" value={date} readOnly />

          <p className="feedback-pollicy"> 
            <span className="star-mark">*</span>The information you provide will be kept confidential, 
            and your personal details will never be exposed under any circumstances. 
            Your feedback will solely be used to improve the mentor-student experience.
          </p>

          <button type="submit">Submit Feedback</button>
        </form>
      </div>
       <ToastContainer />
    </div>
  );
};

export default Feedback;
