import React, { useState}  from 'react'
import { useParams } from 'react-router-dom';
import './ResetPassword.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ResetPassword = () => {

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordVisible1, setPasswordVisible1] = useState(false);
  const [error, setError] = useState({pass:'', repass:''});
  const [formData, setFormData] = useState({pass:'', repass:''})

  const {token} = useParams();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  const togglePasswordVisibility1 = () => {
    setPasswordVisible1(!passwordVisible1);
  };
  const handleChange = (e) => {
    setFormData({ ...formData,[e.target.name]:e.target.value });
    setError({...error,[e.target.name]:''});

  };
  const validation = (event) => {
    event.preventDefault();
    const {pass, repass} = formData;

    const hasUppercase = /[A-Z]/.test(pass);
    const hasLowercase = /[a-z]/.test(pass);
    const hasDigit = /[0-9]/.test(pass);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);

    let passError = '';
    let pass1Error = '';

    if(pass.length < 8){
      passError = 'Password must be at least 8 characters long.';
    }
    else if(!hasDigit || !hasLowercase || !hasUppercase || !hasSpecialChar){
      passError = 'Password must contain an uppercase, lowercase, a digit, and a special character.';
    }
    if(repass !== pass){
      pass1Error = 'Passwords do not match.'
    }
    setError({pass:passError, repass:pass1Error});
    return !(passError || pass1Error)

  };
  
  const handleSubmit = async(e) => {
    e.preventDefault();
    if (!validation(e)){
      return;
    }
    if(formData){
      try {
        const response = await fetch('http://localhost:5001/api/reset-password',{
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pass: formData.pass, repass: formData.repass, token }),
        });

        const data = await response.json();
        if(data.success){
          toast.success(data.message, {autoClose: 10000,});
          setFormData({pass:'', repass:''});
          setError({pass:'', repass:''})
        }
        else if(data.message === 'Invalid or expired token'){
          toast.warn("Your password reset link has expired. Please request a new one.");
          window.location.href = "/forgot-password";
        }
        else{
          toast.warn(data.message);
        }
      } catch (error) {
        toast.error('Error while resetting password.')
        console.log('Error while resetting password.', error);
      }
    }
  }

  return (
    <div className='repass'>
      <form action="" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>

        <div className="repass-wrapper">
        <div className='repass-center'>
          <label htmlFor="">Enter new password </label>
          <div className="lock-icon">
          <i className="fa-solid fa-lock lock"></i>
          </div>
         

          <div className="eye-wrapper">
        <span className="icon" onClick={togglePasswordVisibility}>
            <i className={`fa-solid ${passwordVisible ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          </span>
        </div>

          <input type={passwordVisible ? 'text' : 'password'} name='pass' className={error.pass ? 'error-state' : ''} value={formData.pass} onChange={handleChange} autoFocus required />
          <span className="error" style={{height:'3rem'}}>{error.pass}</span>
          </div>

          <div className='repass-center'>
          <label htmlFor="">Re-enter new password</label>
          <div className="lock-icon">
          <i className="fa-solid fa-lock lock"></i>
          </div>
          

          <div className="eye-wrapper">
        <span className="icon" onClick={togglePasswordVisibility1}>
            <i className={`fa-solid ${passwordVisible1 ? 'fa-eye-slash' : 'fa-eye'}`}></i>
          </span>
        </div>

          <input type= {passwordVisible1 ? 'text' : 'password'} name='repass' className={error.repass ? 'error-state' : ''} value={formData.repass} onChange={handleChange} required />
          <span className="error" style={{height:'1rem'}}>{error.repass}</span>
        </div>
        </div>
        <div className="repass-btn">
        <button>Reset Password</button>
        </div> 
      </form>
      <ToastContainer />
    </div>
  )
}

export default ResetPassword