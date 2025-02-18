import React, {useEffect} from 'react'
import './SessionContent1.css'
import Footer from '../Footer/Footer'
import ReadMore from '../ReadMore/ReadMore'
import Sidebar from '../Sidebar/Sidebar'
import useSessionTimeout from '../../Hooks/useSessionTimeout.jsx'
import  {useNavigate,Link} from 'react-router-dom';



function SessionContent1() {
 
  const {sessionExpired, checkSession} = useSessionTimeout();
  const navigate = useNavigate();

  
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
    <div className='app'>

        <Sidebar/>

        <section id='home'>
          <header className="main-content" >
            <div className="overlay"></div>
            <div className="content">
              <h1>Empowering Students Through Personalized Mentorship</h1>
              <button className="cta-btn" onClick={() => navigate('/session-table')} >View Session Reports</button>
            </div>
          </header>
        </section>



        <section>
        <div className='about-wt'>
          
            <h2>WHAT IS A MENTORING SESSION</h2>
            <ReadMore shortContent="A mentoring session is a structured meeting between a mentor and a mentee aimed at providing guidance, support, and advice to help the mentee develop personally, academically, or professionally."
            longContent="During the session, the mentor shares their experience and expertise, offers feedback, and helps the mentee set and achieve goals. The session may involve discussing challenges, exploring new opportunities, and offering strategies for growth. It creates a supportive environment for the mentee to gain insights, build confidence, and enhance skills, fostering a relationship that encourages ongoing learning and development."/>
        </div>
        <div className='about-why'>
            <h2>WHY WE NEED MENTORING SESSIONS</h2>
            <ReadMore shortContent="Mentoring sessions are essential for university students as they provide personalized guidance that helps navigate academic challenges, career planning, and personal development. Through mentoring, students receive tailored advice on improving their academic performance, managing time effectively, and making informed decisions about their studies."
            longContent="These sessions also play a crucial role in career development, offering insights into professional opportunities, networking, and skill-building for future success. Additionally, mentors provide emotional support, helping students manage stress, build confidence, and develop critical soft skills like communication and problem-solving. Overall, mentoring fosters holistic growth, ensuring students are well-prepared for both academic and professional life."/>
        </div>

        </section>

        <Footer/>

        
    </div>
  )
}

export default SessionContent1
