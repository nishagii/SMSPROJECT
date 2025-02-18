import React from 'react'
import './MentorSignup.css'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MentorSignup = () => {

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordVisible1, setPasswordVisible1] = useState(false);
  const [errors, setErrors] = useState({ email: '', pass: '', pass1:'', phone:'' });
  const [formData, setFormData] = useState({
    name: '',
    dept: '',
    mail: '',
    phone: '',
    user: '',
    pass: '',
    pass1: ''
  });
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  const togglePasswordVisibility1 = () => {
    setPasswordVisible1(!passwordVisible1);
  };

  
  const validate = (event) => {

    const { mail, pass, pass1, phone } = formData;

    const hasUppercase = /[A-Z]/.test(pass);
    const hasLowercase = /[a-z]/.test(pass);
    const hasDigit = /[0-9]/.test(pass);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    const validphone = /[0-9]{10}/.test(phone);

    const endmail = '.cmb.ac.lk';

    const mailPattern = new RegExp(`^[a-zA-Z]+@(iat|ict|et|at)${endmail}$`);

    let emailError = '';
    let passError = '';
    let pass1Error = '';
    let phoneError = '';

    if (!mailPattern.test(mail)) {
      emailError = "Please enter a valid email";
    }
    if (pass.length < 8) {
      passError = "Password must be at least 8 characters long.";
    } else if (!hasUppercase || !hasLowercase || !hasDigit || !hasSpecialChar) {
      passError = "Password must contain an uppercase, lowercase, digit, and  special character.";
    }
    if (pass1 !== pass) {
      pass1Error = "Passwords do not match.";
    }
    if (!validphone) {
      phoneError = 'Please enter a valid phone number';
    }

    setErrors({ email: emailError, pass: passError, pass1: pass1Error, phone: phoneError });

    return emailError || passError || pass1Error || phoneError ;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: ''
    }));
  };

  const checkMail = async (e) => {
    const { value } = e.target;
    setFormData((prevData) => ({ ...prevData, mail: value }));

    if (value) {
      try {
        const response = await fetch('http://localhost:5001/api/check-user-mentor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mail: value }),
        });

        const data = await response.json();
        if (!data.success) {
          setErrors((prevErrors) => ({ ...prevErrors, email: data.message }));
        } else {
          setErrors((prevErrors) => ({ ...prevErrors, email: '' }));
        }
      } catch (error) {
        console.error('Error checking email:', error);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (validate(event)) {
      return;
    }
    try {
      const response = await fetch('http://localhost:5001/api/signupMentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        navigate('/login');
        setFormData({
          name: '',
          dept: '',
          mail: '',
          phone: '',
          user: '',
          pass: '',
          pass1: ''
        });
      } else {
        toast.warn('Signup failed: ' + data.message);
      }
    } catch (error) {
      toast.error('Error occurred while signing up. Please try again later.');
      console.error('Error:', error);
    }
  };

  return (
    <div className='container1'>
      <form action="" id='frm' className='myfrm' onSubmit={handleSubmit}>
        <h2>Sign Up</h2>

        <Link className='xbtn' to="/"><i className="fa-solid fa-xmark"></i></Link>
        
        <label htmlFor="name">Full Name</label>
        <input type="text" id='name' name='name' value={formData.name} onChange={handleChange} autoFocus required />
        
        <label htmlFor="dept">Department</label>
        <select name="dept" id="dept" value={formData.dept} onChange={handleChange}>
          <option value="" selected disabled>Select Department</option>
          <option value="IAT">IAT</option>
          <option value="ICT">ICT</option>
          <option value="AT">AT</option>
          <option value="ET">ET</option>
        </select>
        
        <label htmlFor="email">Email</label>
        <input type="email" name="mail" id='mail' className={errors.email ? 'error-state':''} value={formData.mail} onChange={handleChange} onInput={checkMail} required />
        <span className="error" style={{height:'1rem',marginTop:'-5px'}}>{errors.email}</span>
        
        <label htmlFor="phone">Contact Number</label>
        <input type="text" required name='phone' id='phone' className={errors.phone ? 'error-state':''} value={formData.phone} onChange={handleChange} />
        <span className="error"style={{height:'1rem',marginTop:'-5px'}}>{errors.phone}</span>

        <label>Create Password</label>
        <div className="password-field">
          <input type={passwordVisible ? 'text' : 'password'} id='pass' name='pass' className={errors.pass ? 'error-state':''} value={formData.pass} onChange={handleChange} required />
          <span className="icon" onClick={togglePasswordVisibility}>
            <i className={`fa-solid ${passwordVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          </span>
        </div>
        <span className='error' style={{height:'2rem',marginTop:'-5px'}}>{errors.pass}</span>

        <label>Confirm Password</label>
        <div className="password-field">
          <input type={passwordVisible1 ? 'text' : 'password'} id='pass1' className={errors.pass1 ? 'error-state':''} name='pass1' value={formData.pass1} onChange={handleChange} required />
          <span className="icon" onClick={togglePasswordVisibility1}>
            <i className={`fa-solid ${passwordVisible1 ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          </span>
        </div>
        <span className='error' style={{height:'1rem',marginTop:'-5px'}}>{errors.pass1}</span>

        <button type='submit' disabled = {errors.email === "Email already registered."}>Sign Up</button>
        <div className="cover">
          <h4>Already have an account? <Link to="/login" className='link'>Login</Link></h4>
        </div>

      </form>
      <ToastContainer />
    </div>
  );
};

export default MentorSignup;
