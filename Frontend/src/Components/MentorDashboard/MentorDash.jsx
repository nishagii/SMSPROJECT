import React, {useEffect} from 'react'
import MentorHero from './MentorHero'
import Footer from '../Footer/Footer'
import Sidebar from '../Sidebar/Sidebar.jsx'
import './Mentor.css'
import useSessionTimeout from '../../Hooks/useSessionTimeout.jsx'
import  {Link} from 'react-router-dom'

function MentorDash() {

    const {sessionExpired,checkSession} = useSessionTimeout();

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
            <Sidebar />
            <MentorHero />
            <Footer />
        </div>
    )
}

export default MentorDash
