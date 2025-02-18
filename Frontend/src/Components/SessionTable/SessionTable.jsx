import Footer from '../Footer/Footer'
import Sidebar from '../Sidebar/Sidebar'
import React,{useState, useEffect} from 'react'
import Button from 'react-bootstrap/Button'
import axios from 'axios'
import './SessionTable.css'
import useSessionTimeout from '../../Hooks/useSessionTimeout.jsx'
import  {Link} from 'react-router-dom'
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';


export default function SessionTable() {
  const [mentorName, setMentorName] = useState("");
  const [selectedDate, setSelectedDate] = useState('');
  const [sessionReports, setSessionReports] = useState([]);
  const {sessionExpired, checkSession} = useSessionTimeout();
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [role ,setRole] = useState('');
  const navigate = useNavigate();

  useEffect(() =>{
    const fetchmentorname = async() =>{
      try {
        const response = await axios.get ("http://localhost:5001/api/dashboard",{
          withCredentials: true, // Ensures cookies (session) are sent with the request
        });
        const userRole = response.data.role;
        setRole(userRole);

        if(userRole === 'Mentor'){
          setMentorName(response.data.name)
        
        }else if(userRole === 'Student'){
          setMentorName(response.data.mentor);
        }

      }
      catch(error){
        console.error("mentor name can't be fetched", error.message)
      }
    }
    fetchmentorname();
  },[]);

  const fetchSessionReports = async (e) => {
    e.preventDefault();

    if (!selectedDate || !mentorName){
      return;
    }

    const dateObj = new Date(selectedDate);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1; // Months are zero-based in JS

    try {
      const response = await axios.get(`http://localhost:5001/api/sessions?year=${year}&month=${month}&mentor=${mentorName}`);
      setSessionReports(response.data);
      setIsButtonClicked(true);
    } catch (error) {
      console.error("Error fetching session reports:", error);
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

    

    // Function to delete a session report
    const deleteSessionReport = async (reportId) => {
      confirmAlert({
        customUI: ({ onClose }) => (
          <div className='custom-confirmation-modal'>
            <h2 style={{ color: 'blue' }}>Confirm Deletion</h2>
            <p>Are you sure you want to delete this session report?</p>
            <div>
              <Button 
                variant="success" 
                onClick={async () => {
                  try {
                    const response = await axios.delete(`http://localhost:5001/api/sessions/${reportId}`, { 
                      withCredentials: true 
                    });
    
                    console.log("Server response:", response); // Debugging line
    
                    if (response.status === 200) {
                      toast.success('Session report deleted successfully!');
                      setSessionReports(prevReports => prevReports.filter(report => report._id !== reportId));
                    } else {
                      toast.warn('Failed to delete session report.');
                    }
                  } catch (error) {
                    console.error("Error deleting session report:", error.response ? error.response.data : error.message);
                    toast.error("Failed to delete session report.");
                  }
                  onClose();
                }}>
                Yes
              </Button>
              <Button variant="danger" onClick={onClose} style={{ marginLeft: '10px' }}>
                No
              </Button>
            </div>
          </div>
        )
      });
    };


  return (
    <div>
      <Sidebar/>
        
        <div className='session-table-content'>
        <p>Session Reports For <b style={{ fontFamily: 'Playfair Display, serif' }}>{mentorName}</b></p>

          <form action="" className='session-report-form' onSubmit={fetchSessionReports}>
            <div>
              <label htmlFor="selectDate">Select Year and Month</label>
              <input type="month" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} required />
            </div>
           <Button type='submit' variant="primary" className='report-btn'>see reports</Button>
          </form>
        
       
        <section id="home">
        <div className="reports-container">
        {sessionReports.length > 0 ? (
           sessionReports.map((report, index) => (

            <div key={index} className="report-card">

              <strong>Report #{index + 1}</strong>
              <span></span>

             { role === 'Mentor' &&( <div>
              <button className='report-edit-btn' onClick={() => navigate('/update-form', { state: { reportId: report._id } })}>Edit</button>
              <button className='report-delete-btn' onClick={() => deleteSessionReport(report._id)}>Delete</button>
              </div>)}
              
            
              <strong>Date:</strong> 
              <span>{new Date(report.Date).toLocaleDateString()}</span>
              
              <strong>Department:</strong>
              <span>{report.Department}</span>
              
              <strong>Mentor:</strong>
              <span>{report.Mentor}</span>
              
              <strong>Batch Year:</strong>
              <span>{report.Year}</span>

              <strong>Index Numbers:</strong>
              <span>{report.Index}</span>

              <strong>Session Mode:</strong>
              <span>{report.SessionMode}</span>

              <strong>Additional Note:</strong>
              <span>{report.AdditionalNote || "N/A"}</span>

            </div>
          ))
         
          ) : isButtonClicked ? (
            <div className="no-report-card">
              <h3>No reports are available for this month.</h3>
            </div>
        ): null}
      
        </div>
        </section>
     


      </div>
    <Footer/>
    <ToastContainer />

      
    </div>
  )
}
