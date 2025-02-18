import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './ViewFeedback.css'
import Siderbar from '../Sidebar/Sidebar.jsx'
import Footer from '../Footer/Footer.jsx'
import axios from 'axios'
import useSessionTimeout from '../../Hooks/useSessionTimeout.jsx'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const ViewFeedback = () => {
  
  const [feedbacks, setFeedbacks] = useState([]);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const {sessionExpired, checkSession} = useSessionTimeout();

    const dateObj = new Date(selectedDate);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const monthAndYear = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });

  const fetchFeedbacks = async (e) => {
    e.preventDefault();

    try{
      const response = await axios.get('http://localhost:5001/api/get-feedbacks',{
        params:{year:year, month:month}
      });
      setFeedbacks(response.data);
      setIsButtonClicked(true);
    }catch(error){

    }
    
  };

  const handleDelete = (feedbackId) => {
    confirmAlert({
      title: "Confirm Deletion",
      message: "Are you sure you want to delete this feedback?",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            try {
              const response = await axios.delete('http://localhost:5001/api/delete-feedback', {
                data: { id: feedbackId }
              });
  
              if (response.data.success) {
                toast.success("Feedback deleted successfully!");
                setFeedbacks((prevFeedbacks) => prevFeedbacks.filter(f => f._id !== feedbackId));
              }
            } catch (error) {
              console.error("Error deleting feedback:", error);
              toast.error("Failed to delete feedback!");
            }
          },
        },
        {
          label: "No",
          onClick: () => toast.info("Deletion canceled"),
        },
      ],
    });
  };
  
  const handleDeleteAll = async () => {
    if(feedbacks.length > 0){
      const feedbackIds = feedbacks.map((feedback) => feedback._id);
      
      confirmAlert({
        title: "Confirm Deletion",
        message: `Are you sure you want to delete all feedbacks for ${monthAndYear}?`,
        buttons: [
          {
            label: "Yes",
            onClick: async () => {
              try {
                const response = await axios.delete('http://localhost:5001/api/delete-feedback', {
                  data: { id: feedbackIds }
                });
    
                if (response.data.success) {
                  toast.success("All feedbacks are deleted successfully!");
                  setFeedbacks((prevFeedbacks) => prevFeedbacks.filter(f => !feedbackIds.includes(f._id)));
                }
              } catch (error) {
                console.error("Error deleting feedbacks:", error);
                toast.error("Failed to delete feedbacks!");
              }
            },
          },
          {
            label: "No",
            onClick: () => toast.info("Deletion canceled"),
          },
        ],
      });
    }
  };
  
  useEffect(() => {
        checkSession(); // Trigger session check on component mount
      }, []);
    
      if (sessionExpired) {
        return (
          <div className="session-expired-overlay">
            <div className="session-expired-message">
              <h2><i class='bx bxs-error warning'></i>Session Expired</h2>
              <p>Your session has expired. Please log in again.</p>
              <Link to="/login" className='link'>Login</Link>
            </div>
          </div>
        );
      }
      
  return (
    <div>
      <Siderbar />
      <section id='home'>
      <div>
        <form onSubmit={fetchFeedbacks} className='view-feedback-form'>
          <h2>Feedbacks</h2>
          <div>
            <span style={{ fontWeight: 'bold' }}>Select Year and Month</span>
            <input type="month" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} required />
          </div>

          <div>
            <button type='submit' className='view-feedback-btn'>See Feedbacks</button>

            { isButtonClicked && feedbacks.length > 0 ? (
              <button type='submit' className='delete-all-feedbacks' onClick={handleDeleteAll}>Delete All</button>
            ) : null}
          </div>
         
        </form>

        <div className="view-feedback-container">
          {feedbacks.length > 0 ? (
            feedbacks.map((feedback, index) => (
              <div key={index} className="view-feedback-card">

              
                <strong>Feedback #{index + 1} </strong>
                <button className='feedback-delete-btn' onClick={() => handleDelete(feedback._id)}>Delete</button>
                <strong>Date</strong>
                <span>{new Date(feedback.Date).toLocaleDateString()}</span>

                <strong>Mentor Name</strong>
                <span>{feedback.Mentor}</span>

                <strong>Description</strong>
                <span>{feedback.Description}</span>
              </div>
            ))
          ) :  isButtonClicked ? (
            <div className="no-feedback-card">
              <h3>No Feedbacks are available for this month.</h3>
            </div>
        ): null}
        </div>
        </div>
      </section>
      
      
      <Footer />
      <ToastContainer />
    </div>
  );
}

export default ViewFeedback;
