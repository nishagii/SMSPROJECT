import React, {useEffect} from 'react'
import Studenthero from './StudentHero'
import Sidebar from '../Sidebar/Sidebar.jsx'
import Footer from '../Footer/Footer.jsx'
import useSessionTimeout from '../../Hooks/useSessionTimeout.jsx'
import  {Link} from 'react-router-dom'

function StudentDash() {
  const {sessionExpired, checkSession} = useSessionTimeout();

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
      <Studenthero />
      <Footer />
    </div>
  )
}

export default StudentDash
