import React from 'react'
import './SessionForm.css'
import Select, { components } from 'react-select';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 




function SessionForm() {
  const location = useLocation();
  const sessionDetails = location.state?.sessionDetails || {};
  const isEdit = location.state?.isEdit || false;
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [formData, setFormData] = useState({
    dept: sessionDetails.Department || '',
    mentor: sessionDetails.Mentor || '',
    year: sessionDetails.Year || '',
    student: sessionDetails.Index ? sessionDetails.Index.split(', ') : [],
    date: sessionDetails.Date || '',
    mode: sessionDetails.SessionMode || '',
    note: sessionDetails.AdditionalNote || '',
  });

  
   // Function to fetch mentors from the backend
   const fetchMentors = async (dept) => {
    console.log("Fetching mentors for department:", dept); // Debugging

    try {
        const response = await fetch(`http://localhost:5001/api/mentors/${dept}`);
        const data = await response.json();
        console.log("Fetched mentors:", data); // Debugging

        if (!Array.isArray(data)) {
            throw new Error("Invalid data format received");
        }

        const formattedMentors = data.map(mentor => ({ value: mentor, label: mentor }));
        setMentors(formattedMentors);
      } catch (error) {
        console.error('Error fetching mentors:', error);
      }
    };
  
  // Function to fetch students from the backend
  const fetchStudents = async (year, mentor) => {
    if (!year || !mentor){
      console.log("Batch year or mentor not selected yet.");
      return;
    } // Ensure both fields are selected before fetching

    try {
        const response = await fetch(`http://localhost:5001/api/students/${encodeURIComponent(year)}/${encodeURIComponent(mentor)}`);
        const data = await response.json();

        console.log("Students received:", data); // Debugging
        console.log(response);

        if (Array.isArray(data) && data.length > 0) {
          setStudents(data);
      } else {
          setStudents([]); // Ensure empty state if no students
      }
    } catch (error) {
        console.error('Error fetching students:', error);
    }
};


  const handleStudentChange = (selectedStudents) => {
    setSelectedStudents(selectedStudents || []);

    setFormData((prevFormData) => ({
      ...prevFormData,
      student: selectedStudents ? selectedStudents.map(option => option.value) : [], // Ensure values are stored
    
    }));
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prevFormData => {
        const updatedFormData = { ...prevFormData, [name]: value };

        if (name === 'dept') {
            fetchMentors(value);
            return { ...updatedFormData, mentor: '', student: [] }; // Reset related fields
        } else if (name === 'mentor' || name === 'year') {
            fetchStudents(updatedFormData.year, updatedFormData.mentor);
        }

        return updatedFormData;
    });
};


  const handleMentorChange = (selectedMentor) => {
    const mentorValue = selectedMentor ? selectedMentor.value : '';

    setFormData(prevFormData => {
      const updatedFormData = { ...prevFormData, mentor: mentorValue };
      fetchStudents(updatedFormData.year, mentorValue); // Fetch students immediately after update
      return updatedFormData;
    });
};

  

  const clearForm =() => {
    setFormData({
      dept:'',
      mentor:'',
      year:'',
      date:'',
      mode:'',
      note:''
    });
    setSelectedStudents([]);
    setStudents([]);
    setMentors([]);
  };

  const MultiValue = ({ index, getValue, ...props }) => {
    const selectedValues = getValue();
    if (index === 2) {
      return (
        <div style={{ padding: '5px', fontSize:'14px' }}>
          + {selectedValues.length - 2} more
        </div>
      );
    }
    if (index > 2) {
      return null;
    }
    return <components.MultiValue {...props} />;
  };

  const handleClose = () => {
    navigate(-1); 
  }; 

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const sessionData = {
      Department: formData.dept.trim(),
      Mentor: formData.mentor.trim(),
      Year: formData.year.trim(),
      Index: formData.student.length > 0 ? formData.student.join(', ') : "", 
      Date: formData.date,
      SessionMode: formData.mode.trim(),
      AdditionalNote: formData.note ? formData.note.trim() : '',
    };
  
    try {
      const method = isEdit ? 'PUT' : 'POST';
      const url = isEdit 
        ? `http://localhost:5001/api/sessions/${sessionDetails._id}`
        : 'http://localhost:5001/api/SessionInfo';
  
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });
  
      const responseData = await response.json();
  
      if (!response.ok) {
        console.log("Server response:", responseData);
        toast.warn(`Error: ${responseData.message}`);
        return;
      }
      
      toast.success(isEdit ? 'Session updated successfully!' : 'Session stored successfully!', { autoClose: 2000 });
      clearForm();
    } catch (error) {
      console.error('Error submitting session:', error);
      toast.error('Failed to submit session.');
    }
  };  

  return (
    <div className='session'>
      <form action='' onSubmit={handleSubmit}>
        <h2>Session Data</h2>

        <i className="fa-solid fa-xmark" onClick={handleClose}></i>

        <label htmlFor="dept">Department:</label>
<select name="dept" id="dept" value={formData.dept} onChange={handleChange} disabled={isEdit} required>
    <option value='' disabled>Select Department</option>
    <option value="IAT">IAT</option>
    <option value="ICT">ICT</option>
    <option value="AT">AT</option>
    <option value="ET">ET</option>
</select>

<label htmlFor="mentor">Mentor:</label>
<Select
  name="mentor"
  id="mentor"
  options={mentors}
  value={mentors.find(m => m.value === formData.mentor) || null}
  onChange={handleMentorChange}
  placeholder="Select Mentor"
  isSearchable
  isDisabled={isEdit} // Prevent editing
/>
        
        <label htmlFor="year">Batch year: </label>
        <select name="year" id="year" value={formData.year} onChange={handleChange} required>
            <option value='' disabled selected>Select Year</option>
            <option value="19/20">19/20</option>
            <option value="20/21">20/21</option>
            <option value="21/22">21/22</option>
            <option value="22/23">22/23</option>
        </select>

        <label htmlFor="student">Student Index:</label>
        <Select
          name='student'
          id='student'
          isMulti
          options={students}
          value={students.filter(s => formData.student.includes(s.value))}
          onChange={handleStudentChange}
          placeholder="Select Students"
          isSearchable={true}
          closeMenuOnSelect={false}
          noOptionsMessage={() => students.length === 0 ? "No students available" : "Loading students..."}
          className='select-student'
          components={{ MultiValue }}
          required
        />


        <label htmlFor="date"  >Date: </label>
        <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required/>

        <label htmlFor="mode" >Mode of Session:</label>
        <select name="mode" id="mode" value={formData.mode} onChange={handleChange} required>
            <option value='' disabled selected>Select Mode</option>
            <option value="Online">Online</option>
            <option value="Physycal">Physical</option>
        </select>

        <label htmlFor="additionalnote">Additional Note:</label>
        <textarea name="note" id="note" value={formData.note} onChange={handleChange} rows={4} cols={30}></textarea>

      <div className='session-update-btn'>
        <button type='submit' className='sub-btn'>submit</button>
        <button type='clear' className='clear-btn' onClick={clearForm}>Clear</button>
        </div>
  
      </form>
      <ToastContainer />
    </div>
  )
}

export default SessionForm