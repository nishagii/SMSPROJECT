
import React, {useState,useEffect} from 'react';
import './Profile.css';
import Sidebar from '../Sidebar/Sidebar.jsx';
import Footer from '../Footer/Footer.jsx';
import axios from 'axios';
import profilePic from '../../assets/profilepic.png';
import useSessionTimeout from '../../Hooks/useSessionTimeout.jsx'
import  {Link} from 'react-router-dom'

const Profile = () => {

  const [studentData, setStudentData] = useState({name:'',sid:'',email:'',batchyear:'',role:'',mentor:'',dept:''});
  const [mentorData, setMentorData] = useState({name: '',email: '',role: '',dept: '',phone: '' });
  const [role, setRole] = useState('');
  const [mail, setMail] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [click, setClick] = useState(false);
  const {sessionExpired, checkSession} = useSessionTimeout();

useEffect(() => {
  window.scrollTo(0, 0);
  const fetchRole = async () => {
      try {
          const response = await axios.get('http://localhost:5001/api/dashboard', { withCredentials: true });
          setRole(response.data.role);
          setMail(response.data.email);
          if(response.data.role === 'Student'){
            setStudentData(response.data);
          }else if(response.data.role === 'Mentor'){
            setMentorData(response.data);
          }
      } catch (error) {
        console.error('Error fetching role:', error.response ? error.response.data : error.message);
      }
  };
  fetchRole();
}, []);

useEffect(() => {
  const fetchImage = async () => {  
    if (mail && role) {
      try {
        const response = await axios.get('http://localhost:5001/api/image', {
          params: { email: mail, role: role }
        });
  
        if (response.data.success) {
          const imagePath = response.data.image; 
          const imageCheckResponse = await axios.get('http://localhost:5001/api/check-image', {
            params: { image: imagePath.replace('/uploads/', '') }
          });
  
          if (imageCheckResponse.data.success) {
            setSelectedImage(`http://localhost:5001/api${imagePath}`);
          } else {
            setSelectedImage(null); // Fallback to default image
          }
        } else {
          setSelectedImage(null); // Fallback to default image
        }
      } catch (error) {
        console.error('Error fetching image:', error);
        setSelectedImage(null); // Fallback to default image
      }
    }
  };  
  fetchImage();
  }, [mail, role]);

  const handleClick = () => {
    setClick(!click);
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
      <Sidebar />
      <div className="profile root">
      <section id="home">

        {role === 'Student' && (

      <div>
        <div className='prof-head'>
          <img src={selectedImage || profilePic} alt="Profile Picture" onClick={handleClick} />
          <label>{studentData.name}</label>
          </div>
          <div className='stud-prof'>

           <div className='edit-prof'>
            <h2>Student Information</h2>
            <Link to="/edit-student-profile" className='link'><button>Edit Profile</button></Link>
          </div> 
          
          <div className="info-grid">
          <strong>Student Name</strong>
          <span>{studentData.name}</span>

          <strong>Student Id</strong>
          <span>{studentData.sid}</span>

          <strong>Mentor Name</strong>
          <span>{studentData.mentor}</span>

          <strong >Student Mail</strong>
          <span>{studentData.email}</span>

          <strong >Batch Year</strong>
          <span>{studentData.batchyear}</span>

          <strong >Department</strong>
          <span>{studentData.dept}</span>

          </div>
          </div>
          </div>
        )}

        {role === 'Mentor' && (

          <div>
          <div className='prof-head'>
          <img src={selectedImage || profilePic} alt="Profile Picture" onClick={handleClick} />
          <label>{mentorData.name}</label>
          </div>
          <div className='stud-prof'>

          <div className='edit-prof'>
           <h2>Mentor Information</h2>
           <Link to="/edit-mentor-profile" className='link'><button>Edit Profile</button></Link>
         </div> 
         
         <div className="info-grid">
         <strong>Mentor Name</strong>
         <span>{mentorData.name}</span>

         <strong >Mentor Mail</strong>
         <span>{mentorData.email}</span>

         <strong >Department</strong>
         <span>{mentorData.dept}</span>

         <strong>Phone Number</strong>
         <span>{mentorData.phone}</span>

         </div>
         </div>
         </div>
        )}
  
        {click && (
          <div className='lg-cont' onClick={handleClick}>
            <img src={selectedImage || profilePic} alt="Profile Picture" className={`${selectedImage ? 'custom-image' : 'default-image'}`} />

          </div>
        )}

      </section>
      </div>
      <Footer />
    </div>
  )
}

export default Profile
