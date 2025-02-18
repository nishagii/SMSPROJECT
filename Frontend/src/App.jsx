import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Snowfall from 'react-snowfall';
import StudentSignup from './Components/StudentSignup/StudentSignup.jsx'
import MentorSignup from './Components/MentorSignup/MentorSignup.jsx'
import Login from './Components/Login/Login.jsx'
import Role from './Components/Role/Role.jsx';
import Home from './Home.jsx';
import ForgotPassword from './Components/ForgotPassword/ForgotPassword.jsx';
import StudentDash from './Components/StudentDashboard/StudentDash.jsx';
import MentorDash from './Components/MentorDashboard/MentorDash.jsx'
import ResetPassword from './Components/ResetPassword/ResetPassword.jsx';
import SessionForm from './Components/SessionForm/SessionForm.jsx';
import SessionContent1 from './Components/SessionContent/SessionContent1.jsx';
import Calendar from './Components/Calendar/Calendar.jsx';
import Profile from './Components/Profile/Profile.jsx';
import StudentEditProfile from './Components/EditProfile/StudentEditProfile.jsx';
import MentorEditProfile from './Components/EditProfile/MentorEditProfile.jsx';
import MentorProfile from './Components/MentorProfile/MentorProfile.jsx';
import ErrorPage from './Components/About/ErrorPage/ErrorPage.jsx';
import Feedback from './Components/Feedback/Feedback.jsx';
import SessionTable from './Components/SessionTable/SessionTable.jsx';
import ViewFeedback from './Components/ViewFeedback/ViewFeedback.jsx';
import UpdateForm from './Components/UpdateForm/UpdateForm.jsx';
import Message from './Components/Message/Message.jsx';
import Admin from './Components/Admin/Admin.jsx';

const App = () => {

  const showSnow = new Date().getMonth() === 11;

  return (
    <div>
     
      
      <Router>
      <Routes>
        <Route path='/' element={<Home /> } />
        <Route path="/login" element={<Login />} />
        <Route path="/role" element={<Role />} />
        <Route path="/mentor-signup" element={<MentorSignup />} />
        <Route path="/student-signup" element={<StudentSignup />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/student-dashboard' element={<StudentDash />} />
        <Route path='/mentor-dashboard' element={<MentorDash />} />
        <Route path='/reset-password/:token' element={<ResetPassword />} />
        <Route path='/session-form' element={<SessionForm />} />
        <Route path='/session-page' element={<SessionContent1 />} />
        <Route path='/calendar' element={<Calendar />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/edit-student-profile' element={<StudentEditProfile />} />
        <Route path='/edit-mentor-profile' element={<MentorEditProfile />} />
        <Route path='/mentor-profile' element={<MentorProfile />} />
        <Route path='/feedback' element={<Feedback />} />
        <Route path="/session-table" element={<SessionTable />} />
        <Route path='/view-feedback' element={<ViewFeedback />} />
        <Route path='*' element={<ErrorPage />} />
        <Route path='/update-form' element={<UpdateForm />} />
        <Route path="/messages" element={<Message />} />
        <Route path='/admin-dashboard' element={ <Admin /> } />
        
      </Routes>
    </Router>
    {showSnow && <Snowfall snowflakeCount={250} style={{ zIndex:'2000' }} />}
    </div>
  )
}

export default App