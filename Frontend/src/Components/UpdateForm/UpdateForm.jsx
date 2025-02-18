import React from 'react'
import Select, { components } from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function UpdateForm() {
    const location = useLocation();
    const { reportId } = location.state || {};
    const [mentors, setMentors] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        dept: '',
        mentor: '',
        year: '',
        student: [],
        date: '',
        mode: '',
        note: '',
    });

    useEffect(() => {
        if (!reportId) return;
        fetchReportDetails(reportId);
    }, [reportId]);

    const fetchReportDetails = async (id) => {
        try {
            const response = await axios.get(`http://localhost:5001/api/sessions/${id}`);
            const data = response.data;

            const formattedStudents = data.Index ? data.Index.split(', ').map(student => ({
                value: student,
                label: student
            })) : [];

            setFormData({
                dept: data.Department || '',
                mentor: data.Mentor || '',
                year: data.Year || '',
                student: formattedStudents.map((s) => s.value),
                date: data.Date ? data.Date.split('T')[0] : '',
                mode: data.SessionMode || '',
                note: data.AdditionalNote || '',
            });
            setSelectedStudents(formattedStudents); // Initialize selectedStudents

            fetchMentors(data.Department);
            fetchStudents(data.Year, data.Mentor);

        } catch (error) {
            console.error("Error fetching session report:", error);
            toast.error("Failed to fetch session report.");
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
      
        // Prepare the data to be sent to the backend
        const updatedData = {
          Department: formData.dept,
          Mentor: formData.mentor,
          Year: formData.year,
          Index: formData.student.join(', '), // Convert array to comma-separated string
          Date: formData.date,
          SessionMode: formData.mode,
          AdditionalNote: formData.note,
        };
      
        try {
          // Send a PUT request to update the session
          const response = await axios.put(`http://localhost:5001/api/sessions/${reportId}`, updatedData, {
            withCredentials: true, // Include credentials if needed
          });
      
          if (response.status === 200) {
            toast.success("Session Updated Successfully!");
            setTimeout(() => {
                navigate('/session-table'); // Redirect back to session table
            }, 1000); 
           
          } else {
            toast.error("Failed to update session.");
          }
        } catch (error) {
          console.error("Error updating session:", error);
          toast.error("Failed to update session.");
        }
      };

      const handleClose = () => {
        navigate(-1); 
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

        // Function to fetch mentors from the backend
        const fetchMentors = async (dept) => {
            if (!dept) return;
            try {
                const response = await axios.get(`http://localhost:5001/api/mentors/${dept}`);
                const data = response.data;
    
                setMentors(data.map(mentor => ({ value: mentor, label: mentor })));
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

const handleStudentChange = (selectedOptions) => {
    setSelectedStudents(selectedOptions || []);

    setFormData(prevFormData => ({
      ...prevFormData,
      student: selectedOptions ? selectedOptions.map(option => option.value) : [],
    
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prevFormData => {
        const updatedFormData = { ...prevFormData, [name]: value };

        if (name === 'dept') {
            fetchMentors(value);
            return { ...updatedFormData, mentor: '', student: [] }; // Reset related fields
        } else if (name === 'mentor' || name === 'year') {
            fetchStudents(updatedFormData.mentor,updatedFormData.year );
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

  return (
    <div className='session'>
      
      <form onSubmit={handleSubmit}>
        <h2>Update Session Data</h2>

        <i className="fa-solid fa-xmark" onClick={handleClose} ></i>
       
        <label htmlFor="dept">Department:</label>
        <select name="dept" id="dept" value={formData.dept} onChange={handleChange}  required>
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
          value={mentors.find(m => m.value === formData.mentor) || null}
          onChange={handleMentorChange}
          options={mentors}
          placeholder="Select Mentor"
          isSearchable
          required
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
          value={selectedStudents}
          onChange={handleStudentChange}
          isMulti
          options={students}
          placeholder="Select Students"
          isSearchable={true}
          closeMenuOnSelect={false}
          className='select-student'
          components={{ MultiValue }}
          required
        />


        <label htmlFor="date"  >Date: </label>
        <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} required/>

        <label htmlFor="mode" >Mode of Session:</label>
        <select name="mode" id="mode" value={formData.mode} onChange={handleChange} required>
            <option value='' disabled>Select Mode</option>
            <option value="Online">Online</option>
            <option value="Physycal">Physical</option>
        </select>

        <label htmlFor="additionalnote">Additional Note:</label>
        <textarea name="note" id="note" rows={4} cols={30} value={formData.note} onChange={handleChange}></textarea>

        <div className='session-update-btn'>
          <button type='submit' className='sub-btn'>Update</button>
        </div>
  
      </form>
      <ToastContainer />
    </div>
  )
}