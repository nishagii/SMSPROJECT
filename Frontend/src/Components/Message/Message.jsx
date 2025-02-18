import React, { useEffect, useState } from 'react'
import './Message.css'
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import useSessionTimeout from '../../Hooks/useSessionTimeout.jsx'

const Message = () => {

  const navigate = useNavigate();
  const [role,setRole] = useState('');
  const {sessionExpired, checkSession} = useSessionTimeout();

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/dashboard', { withCredentials: true });
        setRole(response.data.role);
      } catch (error) {
        console.error('Error fetching role:', error.response ? error.response.data : error.message);
      }
    };
    fetchRole();
  }, []);
  console.log(sessionExpired);
  const handleGoBack = () => {
    if(role === 'Student'){
    navigate('/student-dashboard');
  }else if(role === 'Mentor'){
    navigate('/mentor-dashboard');
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

      <button type='button' onClick={handleGoBack} className='msg-go-back'>Go Back to Dashboard</button>
        
      <iframe
        src="http://localhost:3000" // ChatApp URL
        title="ChatApp"
        width="100%"
        height="510px"
        style={{ border: 'none' }}
      />
    </div>
  )
}

export default Message
