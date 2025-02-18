import React, {useState} from 'react'
import './ForgotPassword.css'
import { Link } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ForgotPassword = () => {

const [mail, setMail] = useState('');
const [errors, setErrors] = useState('');
const [isLoading, setIsLoading] = useState(false);

const handleChange = (e) => {
   setMail(e.target.value);
   setErrors('');
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    
    const response = await fetch('http://localhost:5001/api/forgot-password',{
      method: "POST",
      headers:{'Content-Type': 'application/json'},
      body: JSON.stringify({mail}),
    });

    const data = await response.json();
    console.log(data.success);
    if(data.success){
      toast.success("Mail has been sent, please go and check your mailbox");
      setMail("");
    
    }else{
      setErrors('The email you entered was not found. Please make sure to use the email, you provided during the signup process.')
    }
  } catch (error) {
    toast.error('Error occurred while sending mail. Please try again later.');
    console.log('Error:', error);
  } finally {
    setIsLoading(false); 
  }
};

  return (

    <div className='fpcont'>
      
      <form action="" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        <Link className='xbtn' to="/login"><i className="fa-solid fa-xmark"></i></Link>

        <div className="envelope-wrapper">
        <label htmlFor="">Email</label>
        <i className="fa-solid fa-envelope"></i>
        <input type="email" required autoFocus placeholder='enter your university mail' value={mail} onChange={handleChange} className={errors ? 'error-state' : ''}/>
        </div>

        <div>
        <span className='error' style={{height:'4rem'}}>{errors}</span>
        </div>
        <div className="fpbtn">
        <button className='fp-btn' id={isLoading ? 'loading' : ''} disabled={isLoading} >{isLoading ? "Sending..." : "Send Mail"}</button>
        </div>
      </form>
      <ToastContainer />
    </div>
    
    
    
  )
}

export default ForgotPassword