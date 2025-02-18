import React from 'react';
import './EditProfile.css';
import profilePic from '../../assets/profilepic.png';
import Sidebar from '../Sidebar/Sidebar.jsx';
import Footer from '../Footer/Footer.jsx';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useSessionTimeout from '../../Hooks/useSessionTimeout.jsx';


const StudentEditProfile = () => {
  const [studentData, setStudentData] = useState({ name: '', sid: '', email: '', batchyear: '', role: '', mentor: '', dept: '' });
  const [errors, setErrors] = useState({ id: '', email: ''});
  const [role, setRole] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [mail, setMail] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const menuRef = useRef(null);
  const [mentorList, setMentorList] = useState([]);
  const fileInputRef = useRef(null);
  const {sessionExpired, checkSession} = useSessionTimeout();

  const fetchMentors = async (department) => {
    try {
      const response = await axios.get(`http://localhost:5001/api/mentors?department=${department}`);
      setMentorList(response.data); // Update mentorList
    } catch (error) {
      console.error('Error fetching mentor list:', error);
    }
  };

  // Fetch the role and student data
  useEffect(() => {

    const fetchRole = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/dashboard', { withCredentials: true });
        setRole(response.data.role);
        setMail(response.data.email);
        if (response.data.role === 'Student') {
          setStudentData(response.data);

          if (response.data.dept) {
            console.log(response.data.dept);
            await fetchMentors(response.data.dept);
          }
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

  const handleClick = (event) => {
    event.stopPropagation();
    setIsOpen(!isOpen);
  };

  // Close the menu when clicking outside of it
  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {

    document.addEventListener('click', handleClickOutside);

    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  const handleChange = async (e) => {
    const { name, value } = e.target;

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '', // Clear the error for the field being edited
    }));

    setStudentData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
      
    }));
    if(name === 'dept'){
      await fetchMentors(value);
  }
  };

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file); // Temporary preview
      setSelectedImage(previewURL); // Set the preview first
      

      const formData = new FormData();
      formData.append('image', file);
      formData.append('mail', mail);

      try {
        // Send the image to the server using Axios
        const response = await axios.post('http://localhost:5001/api/update-student-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data', // Ensure the server knows it's a file upload
          },
          withCredentials: true,
        });
  
        if (response.data.success) {
          const imagePath = response.data.image; // Get the actual server image path
          setSelectedImage(`http://localhost:5001/api${imagePath}`);
          toast.success('Image uploaded successfully');
        } else {
          toast.warn('Error uploading image');
        }
      } catch (error) {
        console.error('Error uploading file:', error.response ? error.response.data : error.message);
      }
    }
  };

  const handleRemove = async () => {
    try {
      console.log(selectedImage)
      const imageName = selectedImage.split('/').pop();
      
      const response = await axios.delete('http://localhost:5001/api/delete-image', {
        data: { image: imageName } // Pass the image path or ID that you want to delete
      });

      if (response.data.success) {
        setSelectedImage(profilePic);
        toast.success('Image removed successfully');
      } else {
        toast.warn('Failed to remove the image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Error removing the image');
    }
  };

  const checkMail = async (e) => {
    const { value } = e.target;
    setStudentData((prevData) => ({ ...prevData, email: value }));


    if (value) {
      try {
        const response = await fetch('http://localhost:5001/api/check-user-student', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mail: value }),
        });

        const data = await response.json();
        if (!data.success) {
          setErrors((prevErrors) => ({ ...prevErrors, email: data.message }));
          console.log(emailErr)
        } else {
          setErrors((prevErrors) => ({ ...prevErrors, email: '' }));
        }
      } catch (error) {
        console.error('Error checking mail:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { sid, email } = studentData;

    let idError = '';
    let emailError = '';

    const idPattern = /^20\d{2}t\d{5}$/;
    const endmail = 'stu.cmb.ac.lk';
    const mailPattern = new RegExp(`^${sid}@${endmail}$`);

    if (!idPattern.test(sid)) {
      idError = 'Please enter a valid ID.';
    }

    let userid = email.split("@")[0];

    if (userid != sid) {
      emailError = 'Email does not match with given ID';
    }
    else if (!mailPattern.test(email)) {
      emailError = 'Please enter a valid email.';
    }

    if (idError || emailError) {
        setErrors({ id: idError, email: emailError });
        return;
    }

    try {
      const response = await axios.put('http://localhost:5001/api/upload-profile', {
       email: mail,
       role: role,
       data: studentData,
      });

      if(response.data.success){
        toast.success('Profile Uploaded Successfully');
      }
      else{
        toast.warn('Failed to Upload Profile');
      }
    }catch(error){
      console.error('Error Profile uploading:', error);
      toast.error("Error While Uploading Profile");
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
      <Sidebar image ={selectedImage} />
      <div className="upload-prof root">
        <section id="home">
          <form action="" className="form" onSubmit={handleSubmit}>
            <div className="edit-image" >
            <img src={selectedImage || profilePic } alt="" />
              <span onClick={handleClick} >Edit<i className="bx bxs-pencil"></i></span>
            
                <ul className={isOpen?'show':'hide'} ref={menuRef}>
                  <li className="add-pic-li" onClick={handleFileInputClick}>Add Picture</li>
                  <li onClick={handleRemove}>Remove Picture</li>
                </ul>

                <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }} // Hide the file input
                onChange={handleFileChange}
              />
            </div>
            <label htmlFor="">Student Name</label>
            <input type="text" name="name"  value={studentData.name} onChange={handleChange} />
            <label htmlFor="">Student Id</label>
            <input type="text" name="sid" className={errors.id ? 'error-state' : ''} value={studentData.sid} onChange={handleChange} />
            <span className="error" style={{ height: '1rem', marginTop: '-5px' }}>{errors.id}</span>
            <label htmlFor="">Department</label>
            <select name="dept" value={studentData.dept} onChange={handleChange}>
              <option value="ICT">ICT</option>
              <option value="IAT">IAT</option>
              <option value="ET">ET</option>
              <option value="AT">AT</option>
            </select>

            <label htmlFor="">Mentor name</label>
            <select id="mentor" name="mentor" value={studentData.mentor} onChange={handleChange}>
              <option value="" disabled>Select Mentor</option>
          {mentorList.map((mentor, index) => (
            <option key={index} value={mentor.name}>{mentor.name}</option>
          ))}
        </select>
            
            <label htmlFor="">Student Mail</label>
            <input type="text" name="email" className={errors.email ? 'error-state' : ''} value={studentData.email} onInput={checkMail} onChange={handleChange} />
            <span className="error" style={{ height: '1rem', marginTop: '-5px' }}>{errors.email}</span>
            <label htmlFor="">Batch Year</label>
            <select name="batchyear" value={studentData.batchyear} onChange={handleChange}>
              <option value="19/20">19/20</option>
              <option value="20/21">20/21</option>
              <option value="21/22">21/22</option>
              <option value="22/23">22/23</option>
            </select>

            <div className="edit-prof">
              <button type="submit">Upload Profile</button>
              <Link to="/profile" className="link"><button>Cancel</button></Link>
            </div>
          </form>
        </section>
      </div>
      <Footer />
      <ToastContainer />
    </div>
  );
};

export default StudentEditProfile;
