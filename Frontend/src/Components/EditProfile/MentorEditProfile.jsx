import React from 'react'
import './EditProfile.css'
import profilePic from '../../assets/profilepic.png';
import Sidebar from '../Sidebar/Sidebar.jsx';
import Footer from '../Footer/Footer.jsx';
import {Link} from 'react-router-dom'
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useSessionTimeout from '../../Hooks/useSessionTimeout.jsx';

const MentorEditProfile = () => {

  const [mentorData, setMentorData] = useState({name: '',email: '',role: '',dept: '',phone: '' });
  const [role, setRole] = useState('');
  const [mail, setMail] = useState('');
  const [errors, setErrors] = useState({ email: '', phone:'' });
  const [selectedImage, setSelectedImage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);
  const {sessionExpired, checkSession} = useSessionTimeout();

  useEffect(() => {
    const fetchRole = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/dashboard', { withCredentials: true });
            setRole(response.data.role);
            setMail(response.data.email);
            if(response.data.role === 'Mentor'){
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

  const handleChange = (e) => {

    const { name, value } = e.target;

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '', // Clear the error for the field being edited
    }));

    setMentorData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
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
        const response = await axios.post('http://localhost:5001/api/update-mentor-image', formData, {
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
        setSelectedImage(profilePic); // Clear the image state if deletion is successful
        toast.success('Image removed successfully');
      } else {
        toast.warn('Failed to remove the image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Error removing the image');
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, phone } = mentorData;

    let emailError = '';
    let phoneError = '';

    const validphone = /^[0-9]{10}$/.test(phone);
    const endmail = '.cmb.ac.lk';
    const mailPattern = new RegExp(`^[a-zA-Z]+@(iat|ict|et|at)${endmail}$`);

    if (!mailPattern.test(email)) {
      emailError = "Please enter a valid email";
    }
    if (!validphone) {
      phoneError = 'Please enter a valid phone number';
    }

    if(emailError || phoneError){
      setErrors({ email: emailError, phone: phoneError });
      return;
    }

    try {
      const response = await axios.put('http://localhost:5001/api/upload-profile', {
       email: mail,
       role: role,
       data: mentorData,
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
    <div onClick={handleClickOutside}>
      <Sidebar image={selectedImage} />
      <div className='upload-prof root'>
        <section id="home">
        <form action="" className='form' onSubmit={handleSubmit}>
        <div className="edit-image">
        <img src={selectedImage || profilePic } alt="" />
        <span  onClick={handleClick}>Edit <i className='bx bxs-pencil'></i></span>
              
        <ul className={isOpen?'show':'hide'} ref={menuRef}>
          <li className='add-pic-li' onClick={handleFileInputClick} >Add Picture</li>
          <li onClick={handleRemove} >Remove Picture</li>  
        </ul>
        <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }} // Hide the file input
                onChange={handleFileChange}
              />
        </div>
        <label htmlFor="">Mentor Name</label>
        <input type="text" name='name' value={mentorData.name} onChange={handleChange} />

        <label htmlFor="">Department</label>
        <select name="dept" value={mentorData.dept} onChange={handleChange}>
        <option value="ICT">ICT</option>
        <option value="IAT">IAT</option>
        <option value="ET">ET</option>
        <option value="AT">AT</option>
      </select>
      
        <label htmlFor="">Mentor Mail</label>
        <input type="text" name='email' className={errors.email ? 'error-state':''} value={mentorData.email} onChange={handleChange} />
        <span className="error" style={{height:'1rem',marginTop:'-5px'}}>{errors.email}</span>

        <label htmlFor="">Phone Number</label>
        <input type="text" name='phone' className={errors.phone ? 'error-state':''} value={mentorData.phone} onChange={handleChange} />
        <span className="error"style={{height:'1rem',marginTop:'-5px'}}>{errors.phone}</span>
        

        <div className='edit-prof'>
        <button type='submit'>Upload Profile</button>
        <Link to='/profile' className='link'><button>Cancel</button></Link>
        </div>
        </form>
        </section>
        
        
      </div>
      <Footer />
      <ToastContainer />
    </div>
  )
}

export default MentorEditProfile;
