import React, { useState, useEffect } from 'react';
import './Calendar.css';
import { Calendar as Calend, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Sidebar from '../Sidebar/Sidebar.jsx';
import Footer from '../Footer/Footer.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import useSessionTimeout from '../../Hooks/useSessionTimeout.jsx'
import { Link } from 'react-router-dom'

const Calendar = () => {
  const localizer = momentLocalizer(moment);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([[], []]);
  const [addFormData, setAddFormData] = useState({ id: '', eventTitle: '', start: '', end: '' });
  const [addMentorEventData, setAddMentorEventData] = useState({id:'', eventTitle: '', date: '', start: '', end: '', mode:'', link:'', description:''});
  const [editFormData, setEditFormData] = useState({ id: '', eventTitle: '', start: '', end: '' });
  const [editMentorEventData, setEditMentorEventData] = useState({id:'', eventTitle: '', date: '', start: '', end: '', mode:'', link:'', description:''});
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [role, setRole] = useState('');
  const [name, setName] = useState('');
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const { sessionExpired, checkSession } = useSessionTimeout();
  const [mode, setMode] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/dashboard', { withCredentials: true });
        setRole(response.data.role);
        setName(response.data.name);
      } catch (error) {
        console.error('Error fetching role:', error.response ? error.response.data : error.message);
      }
    };
    fetchRole();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/get-events', {
        params: {
          role,
          name,
        },
      });

      if (response.status === 200) {
        const { studentEvents, mentorEvents } = response.data;

        const newStudentEvents = studentEvents.map(event => ({
          ...event,
          start: moment.utc(event.start).local().toDate(),
          end: moment.utc(event.end).local().toDate(),
          allDay: false,
          type: 'student'
        }));

        const newMentorEvents = mentorEvents.map(event => {
          const eventDate = moment(event.date, "YYYY-MM-DD");
          // Parse start time
          const [startHour, startMinute] = event.start.split(":").map(Number);
          const startDate = eventDate.set('hour', startHour).set('minute', startMinute).set('second', 0).toDate();
          
          // Parse end time
          const [endHour, endMinute] = event.end.split(":").map(Number);
          const endDate = eventDate.set('hour', endHour).set('minute', endMinute).set('second', 0).toDate();

          return {
              ...event,
              start: startDate,
              end: endDate,
              allDay: false,
              type: 'mentor'
          };
      });
      
        const combinedEvents = [...newStudentEvents, ...newMentorEvents];
        setEvents(combinedEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };


  useEffect(() => {
    fetchEvents();
  }, [role, name]);

  const handleDayClick = (slotInfo) => {

    // Get the currently viewed month's start and end dates
    const currentMonthStart = moment(currentViewDate).startOf('month');
    const currentMonthEnd = moment(currentViewDate).endOf('month');

    // Check if the selected date falls within the current month
    const isOffRange = moment(slotInfo.start).isBetween(currentMonthStart, currentMonthEnd, 'day', '[]');

    if (isOffRange) {
      const formattedDate = moment(slotInfo.start).format("YYYY-MM-DDTHH:mm");
      const rearrangedDate = moment(slotInfo.start).format("YYYY-MM-DD");
      setSelectedDate(formattedDate);
  
      setAddFormData({ ...addFormData, start: formattedDate, end: formattedDate });
      setAddMentorEventData({...addMentorEventData, date: rearrangedDate});
      setShowAddForm(true);
    }
  };

  const handleSelectEvent = async (event) => {
    const formattedDate = moment(event.start).format("YYYY-MM-DDTHH:mm");
    setSelectedDate(formattedDate);
    setSelectedEvent(event);
    setShowAddForm(false);
    setShowEditForm(true);
    console.log(selectedEvent)
      
    if (event.type === 'mentor') {
          setEditMentorEventData({
            eventTitle: event.title,
            date: moment(event.date).format("YYYY-MM-DD"),
            start: moment(event.start).format("HH:mm"),
            end: moment(event.end).format("HH:mm"),
            mode: event.mode,
            link: event.link,
            description: event.description ,
          })
          
    } else if(event.type === 'student'){
        setEditFormData({
          eventTitle: event.title,
          start: moment(event.start).format("YYYY-MM-DDTHH:mm"),
          end: moment(event.end).format("YYYY-MM-DDTHH:mm"),
        });
    }

  };

  const closeAddForm = () => {
    setShowAddForm(false);
    setSelectedDate(null);
    setMode(false);
    setAddFormData({ id: '', eventTitle: '', start: '', end: '' });
    setAddMentorEventData({id:'', eventTitle: '', date: '', start: '', end: '', mode:'', link:'', description:''});
  };

  const closeEditForm = () => {
    setShowEditForm(false);
    setSelectedEvent(null);
    setEditFormData({ id: '', eventTitle: '', start: '', end: '' });
  };

  const handleAddChange = (e) => {
    const { name, value } = e.target;
    setAddFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddMentorChange = (e) => {
    const { name, value } = e.target;

    if(name === 'mode'){
      setMode(value === 'Online');
  }
    setAddMentorEventData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleEditMentorChange = (e) => {
    const { name, value } = e.target;
    setEditMentorEventData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();

    if (new Date(addFormData.start) >= new Date(addFormData.end)) {
      toast.warn('End time must be after start time.');
      return;
    }

    const newEvent = {
      id: uuidv4(),
      title: addFormData.eventTitle,
      start: new Date(addFormData.start).toISOString(),
      end: new Date(addFormData.end).toISOString(),
      allDay: false,
      role,
      name,
    };

    setEvents((prevEvents) => [...prevEvents, newEvent]);

    try {
      const response = await axios.post('http://localhost:5001/api/events', newEvent);
      await fetchEvents();
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response.data.message);
      console.error('Error saving event:', error);
    } finally {
      closeAddForm();
      setEditFormData({ id: '', eventTitle: '', start: '', end: '' });
    }
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();

    const getTimeInMinutes = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };
    
    if (getTimeInMinutes(addMentorEventData.start) >= getTimeInMinutes(addMentorEventData.end)) {
      toast.warn("End time must be after start time.");
      return;
    }
    
    const newEvent = {
      id: uuidv4(),
      title: addMentorEventData.eventTitle,
      date: new Date(addMentorEventData.date).toISOString(),
      start: addMentorEventData.start,
      end: addMentorEventData.end,
      mode: addMentorEventData.mode,
      link: addMentorEventData.link,
      description: addMentorEventData.description,
      allDay: false,
      role,
      name,
    };

    setEvents((prevEvents) => [...prevEvents, newEvent]);

    try {
      const response = await axios.post('http://localhost:5001/api/mentor-events', newEvent);
      await fetchEvents();
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response.data.message);
      console.error('Error saving event:', error);
    } finally {
      closeAddForm();
      setEditFormData({ id: '', eventTitle: '', start: '', end: '' });
    }
  };

  const handleEditEvent = async (e) => {
    e.preventDefault();
    console.log(selectedEvent)
    console.log(editFormData)
  //  console.log('start',selectedEvent.start)
  //  console.log('end',selectedEvent.end)
    if (new Date(editFormData.start) >= new Date(editFormData.end)) {
      toast.warn('End time must be after start time.');
      return;
    }

      const convertToFullDate = (timeString) => {
      const [hours, minutes] = timeString.split(":").map(Number);
      const date = new Date(); // Use today's date
      date.setHours(hours, minutes, 0, 0); // Set extracted time
      return date;
  };
  
  const startTime = convertToFullDate(editMentorEventData.start);
  const endTime = convertToFullDate(editMentorEventData.end);

    if (startTime >= endTime) {
      toast.warn('End time must be after start time.');
      return;
    }
    let updatedEvent = {};

    if(role === 'Student'){
      updatedEvent = {
        ...selectedEvent,
        title: editFormData.eventTitle,
        start: new Date(editFormData.start).toISOString(),
        end: new Date(editFormData.end).toISOString(),
    };
  }else if(role === 'Mentor'){
    updatedEvent = {
      ...selectedEvent,
      title: editMentorEventData.eventTitle,
      date: new Date(editMentorEventData.date).toISOString(),
      start: editMentorEventData.start,
      end: editMentorEventData.end,
      mode: editMentorEventData.mode,
      link: editMentorEventData.link,
      description: editMentorEventData.description
    };
  }

    try {
      const response = await axios.put(`http://localhost:5001/api/events/${selectedEvent._id}/${role}`, updatedEvent);
      await fetchEvents();

      if (response.data.message === 'Event updated successfully') {
        toast.success(response.data.message);
        closeEditForm();
        setEditFormData({ id: '', eventTitle: '', start: '', end: '' });
        setEditMentorEventData({id:'', eventTitle: '', date: '', start: '', end: '', mode:'', link:'', description:''});
      } else if (response.data.message === 'Event not found') {
      } else if (response.data.message === 'Event not found') {
        toast.warn(response.data.message);
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error(error.response.data.message);
    }
  };

  const handleDeleteEvent = async () => {
    try {
      const response = await axios.delete(`http://localhost:5001/api/events/${selectedEvent._id}/${role}`);
      await fetchEvents();

      if (response.data.message === 'Event deleted successfully') {
        toast.success(response.data.message);
        closeEditForm();
        setEditFormData({ id: '', eventTitle: '', start: '', end: '' });
        setEditMentorEventData({id:'', eventTitle: '', date: '', start: '', end: '', mode:'', link:'', description:''});
      } else if (response.data.message === 'Event not found') {
        toast.warn(response.data.message);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error(error.response.data.message);
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
      <Sidebar />
      <section id="home">
        <div className='calc'>
          <Calend
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            selectable
            onSelectSlot={handleDayClick}
            views={{ month: true, agenda: true }}
            onSelectEvent={handleSelectEvent}
            onNavigate={(date) => setCurrentViewDate(date)}
            eventPropGetter={(event) => {
              let className = '';

              if (event.type === 'mentor') {
                className = 'mentor-event';
                
              } else if (event.type === 'student') {
                className = 'student-event';
              }

              return {
                className: className
              };
            }}
          />
        </div>
      </section>

      {role === "Student" && showAddForm && (
        <div className="date-agenda">
          <div className="agenda-content">
            <h3>Add Event on {selectedDate && new Date(selectedDate).toLocaleDateString()}</h3>
            <i className="fa-solid fa-xmark" onClick={closeAddForm}></i>
            <form onSubmit={handleSubmitAdd}>
              <label>Event Title</label>
              <input type="text" name="eventTitle" value={addFormData.eventTitle} onChange={handleAddChange} required />

              <label>Start Time</label>
              <input type="datetime-local" name='start' value={addFormData.start} onChange={handleAddChange} required />

              <label>End Time</label>
              <input type="datetime-local" name='end' value={addFormData.end} onChange={handleAddChange} required />

              <button type="submit" className='save-btn'>Save Event</button>
            </form>
          </div>
        </div>
      )}

      {role=== 'Mentor' && showAddForm && (
        <div className="date-agenda">
        <div className="agenda-content1">
          <h3>Add Session on {selectedDate && new Date(selectedDate).toLocaleDateString()}</h3>
          <i className="fa-solid fa-xmark" onClick={closeAddForm}></i>
          <form onSubmit={handleSubmitEvent}>

            <label>Session Topic</label>
            <input type="text" name="eventTitle" value={addMentorEventData.eventTitle} onChange={ handleAddMentorChange} required />

            <label>Date</label>
            <input type="date" name='date' required value={addMentorEventData.date} onChange={ handleAddMentorChange}/>

            <label>Start Time</label>
            <input type="time" name='start' value={addMentorEventData.start} onChange={ handleAddMentorChange} required />

            <label>End Time</label>
            <input type="time" name='end' value={addMentorEventData.end} onChange={ handleAddMentorChange} required />

            <label>Mode</label>
           <select name="mode" id="" value={addMentorEventData.mode} onChange={ handleAddMentorChange} required>
            <option value="" disabled selected>Select Mode</option>
            <option value="Online">Online</option>
            <option value="Physical">Physical</option>
           </select>

           { mode && (
            <div>
              <label>Add Online Session Link</label>
              <textarea name="link" id="" value={addMentorEventData.link} onChange={ handleAddMentorChange} required></textarea>
            </div>
          )}

           <label>Description</label>
           <textarea name="description" id="" placeholder='Provide any special info about meeting' value={addMentorEventData.description} onChange={ handleAddMentorChange} required></textarea>
            
            <button type="submit" className='save-btn1'>Save Event</button>
          </form>
        </div>
      </div>
      )}

      { selectedEvent?.type === 'student' && showEditForm && (
          <div className="date-agenda">
            <div className="agenda-content">
              <h3>Edit Event on {selectedDate && new Date(selectedDate).toLocaleDateString()}</h3>
              <i className="fa-solid fa-xmark" onClick={closeEditForm}></i>
              <form onSubmit={handleEditEvent}>
                <label>Event Title</label>
                <input type="text" name="eventTitle" value={editFormData.eventTitle} onChange={handleEditChange} required />

                <label>Start Time</label>
                <input type="datetime-local" name='start' value={editFormData.start} onChange={handleEditChange} required />

                <label>End Time</label>
                <input type="datetime-local" name='end' value={editFormData.end} onChange={handleEditChange} required />

                <div className="calc-btns">
                  <button type="submit" className='cal-btn'>Edit Event</button>
                  <button type="button" className='cal-btn' onClick={handleDeleteEvent}>Delete Event</button>
                </div>
                

              </form>
            </div>
        </div>
        
      )};

      { selectedEvent?.type === 'mentor' && showEditForm && (
          <div className="date-agenda">
            <div className="agenda-content1">
              <h3> {role === 'Mentor' ? 'Edit' : ''  } Session on {selectedDate && new Date(selectedDate).toLocaleDateString()}</h3>
              <i className="fa-solid fa-xmark" onClick={closeEditForm}></i>
              <form onSubmit={handleEditEvent}>
    
                <label>Session Topic</label>
                <input type="text" name="eventTitle" value={editMentorEventData.eventTitle} onChange={handleEditMentorChange} required />
    
                <label>Date</label>
                <input type="date" name='date' required value={editMentorEventData.date} onChange={handleEditMentorChange}/>
    
                <label>Start Time</label>
                <input type="time" name='start' value={editMentorEventData.start} onChange={handleEditMentorChange} required />
    
                <label>End Time</label>
                <input type="time" name='end' value={editMentorEventData.end} onChange={handleEditMentorChange} required />
    
                <label>Mode</label>
              <select name="mode" id="" value={editMentorEventData.mode} onChange={handleEditMentorChange} required>
                <option value="" disabled selected>Select Mode</option>
                <option value="Online">Online</option>
                <option value="Physical">Physical</option>
              </select>
    
              { editMentorEventData.mode === 'Online' && (
                <div>
                  <label>Add Online Session Link</label>
                  <textarea name="link" id="" value={editMentorEventData.link} onChange={handleEditMentorChange} required></textarea>
                </div>
              )}
    
              <label>Description</label>
              <textarea name="description" id="" placeholder='Provide any special info about meeting' value={editMentorEventData.description} onChange={handleEditMentorChange} required></textarea>
                

              {role === 'Mentor' &&(
                <div className='session-btn-division' >
                  <button type='submit' className="session-btn">Edit</button>
                  <button type='button' className="session-btn" onClick={handleDeleteEvent}>Delete</button>
                </div>
               
              )}

              </form>
            </div>
        </div>
      )};

      {role === 'Student' && (
        <div className='root event-point'>
          <div className='stud-events'></div>
          <strong>Your Events</strong>
          <div className='mentor-events'></div>
          <strong>Mentor Added Events</strong>
        </div>
      )}

      <Footer />
      <ToastContainer />
    </div>
  );
};

export default Calendar;
