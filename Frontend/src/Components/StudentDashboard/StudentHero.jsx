import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './StudentDash.css';
import moment from 'moment';


function StudentHero() {
    const [studentName, setStudentName] = useState('');
    const [mentorName, setMentorName] = useState('');
    const [batchyear, setBatchYear] = useState('');
    const [resources, setResources] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [resourceType, setResourceType] = useState('');
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const maxSessionsToShow = 3;
    const visibleSessions = showAll ? sessions : sessions.slice(0, maxSessionsToShow);


    // Fetch Student Name
    useEffect(() => {
        const fetchStudentName = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/dashboard', { withCredentials: true });
                setStudentName(response.data.name);
                setMentorName(response.data.mentor);
                setBatchYear(response.data.batchyear);
                console.log('Batch Year fetched:', response.data.batchyear); // Log the batch year
            } catch (error) {
                console.log('Error fetching student name:', error);
            }
        };
        fetchStudentName();
    }, []);

    let setIcon;

    if (resourceType === 'pdf') {
        setIcon = 'bx bxs-file-pdf';
    } else if (resourceType === 'video') {
        setIcon = 'bx bxs-videos'
    } else if (resourceType === 'audio') {
        setIcon = 'bx bxs-music';
    }

    // Fetch Resources
    const fetchResources = async (type, batchyear) => {
        try {
            console.log('Fetching resources with batchYear:', batchyear, 'and type:', type);
            const response = await axios.get('http://localhost:5001/api/resourcesdash', {
                params: { mentorname: mentorName, batchyear: batchyear, type: type }, // Ensure single values
                withCredentials: true,
            });
            console.log('Resources fetched:', response.data);
            setResources(response.data);
            setResourceType(type);
            setShowModal(true);
        } catch (error) {
            console.error('Error fetching resources:', error.response.data, error.message);
            setShowModal(true);
            setResourceType(type);
            setResources([]);

        }
    };

    //Fetch sessions
    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/get-events', {
                    params: { role: 'Mentor', name: mentorName }
                });

                if (response.status === 200) {
                    const { mentorEvents } = response.data;

                    const updatedSessions = mentorEvents
                        .map(session => {
                            const sessionDate = moment(session.date, "YYYY-MM-DD");
                            const today = moment();
                            const sessionEndTime = moment(`${session.date} ${session.end}`, "YYYY-MM-DD HH:mm");

                            if (sessionEndTime.isBefore(today)) {
                                return null; // Exclude past sessions
                            }

                            const daysLeft = sessionDate.diff(today, 'days');

                            return { ...session, daysLeft };
                        })
                        .filter(session => session !== null) // Remove past sessions
                        .sort((a, b) => moment(a.date, "YYYY-MM-DD").valueOf() - moment(b.date, "YYYY-MM-DD").valueOf()); // Sort by date

                    setSessions(updatedSessions);
                }
            } catch (error) {
                console.error('Error fetching sessions:', error);
            }
        };

        fetchSessions();
    }, [mentorName]);




    return (
        <div className='dashboard-container'>
            <div className="studenthero-container">
                <section className="student-welcome home">
                    <p className="student-greeting">
                        Welcome Back<br />
                        <span className="student-name">{studentName}</span>
                        <br />
                        <h4>Mentor Name : <Link to='/mentor-profile' className='mentor-prof'><span className='yourmentor-name'>{mentorName}</span></Link> </h4>

                    </p>
                    <div>
                        <button className="messages-button">Check Messages</button>
                    </div>

                </section>

                <hr />

                {/* Ongoing Info Sessions */}
                <section className='info-sessions'>
                    <div className='sessions-container'>
                        <h2>ONGOING SESSIONS</h2>
                        <div className='sessions'>
                        {visibleSessions.length > 0 ? (
    visibleSessions.map((session, index) => {
        const sessionDate = moment(session.date, "YYYY-MM-DD");
        const today = moment();
        const sessionStartTime = moment(`${session.date} ${session.start}`, "YYYY-MM-DD HH:mm");
        const sessionEndTime = moment(`${session.date} ${session.end}`, "YYYY-MM-DD HH:mm");
        
        const isSessionActive = today.isBetween(sessionStartTime, sessionEndTime);
        let timeLeft;

        // Calculate remaining time
        const diffDays = sessionDate.diff(today, 'days');
        const diffHours = sessionStartTime.diff(today, 'hours');

        if (diffDays > 0) {
            timeLeft = `${diffDays} Days Left`;
        } else if (diffHours > 0) {
            timeLeft = `${diffHours} Hours Left`;
        } else {
            timeLeft = "Starting Soon!";
        }

        return (
            <div
                key={index}
                className='session-card'
                onClick={() => setSelectedSession(selectedSession === index ? null : index)}
            >
                {/* Session Info */}
                <div>
                    <h3 style={{ textAlign: "center" }}>{session.title}</h3>
                    <strong>Date:</strong> <span>{sessionDate.format("YYYY-MM-DD")}</span>
                    <strong>Start Time:</strong> <span>{sessionStartTime.format("hh:mm A")}</span>

                    {/* Show Extra Details When Clicked */}
                    {selectedSession === index && (
                        <div className='session-details'>
                            <strong>End Time:</strong>
                            <span>{sessionEndTime.format("hh:mm A")}</span>

                            <strong>Session Mode:</strong>
                            <span>{session.mode}</span>

                            {session.mode === 'Online' && session.link && (
                                <>
                                    <strong>Session Link:</strong>
                                    <span><a href={session.link} target='_blank' rel='noopener noreferrer'>{session.link}</a></span>
                                </>
                            )}

                            <strong>Description:</strong>
                            <span>{session.description}</span>
                        </div>
                    )}
                </div>

                {/* Countdown & Attend Button */}
                <div className='session-bottom'>
                    <p className='countdown'>{timeLeft}</p>

                    {isSessionActive && session.mode === 'Online' && session.link && (
                        <div className='attend-btn-cont'>
                            <button className='attend-button' onClick={() => window.open(session.link, '_blank')}>
                                Attend
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    })
) : (
    <p>No upcoming sessions available.</p>
)}
           </div>

                        {/* Show More Button */}
                        {sessions.length > maxSessionsToShow && (
                            <div className="show-more-container">
                                <button className="show-more-button" onClick={() => setShowAll(!showAll)}>
                                    {showAll ? "Show Less" : "Show More"}
                                </button>
                            </div>
                        )}
                    </div>
                </section>


                <hr />

                {/* Recommendations */}
                <section className='recommendations'>
                    <h2>Your Recommendations</h2>
                    <div className='recommendation-list'>
                        <div className='recommendation-item' onClick={() => { fetchResources('pdf', batchyear) }}>
                            <p>PDFs</p>
                        </div>
                        <div className="recommendation-item" onClick={() => { fetchResources('video', batchyear) }}>
                            <p>Videos</p>
                        </div>
                        <div className="recommendation-item" onClick={() => { fetchResources('audio', batchyear) }}>
                            <p>Audios</p>
                        </div>
                    </div>
                </section>

                {/* Modal for displaying resources */}
                {showModal && (
                    <div className='modal'>
                        <div className='modal-content'>
                            <h2>{resourceType.toUpperCase()} Resources</h2>
                            {resources.length > 0 ? (
                                <ul>
                                    {resources.map((resource) => (
                                        <li key={resource._id}>

                                            <li className={setIcon}></li>
                                            <a className="no-underline" href={`http://localhost:5001${resource.fileUrl}`} target='_blank' rel='nooper noreferrer'>
                                                {resource.description || resource.fileUrl}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div>
                                    <p>No any {resourceType} Resources have been uploaded yet.</p>
                                </div>
                            )}
                            <button onClick={() => setShowModal(false)}>Close</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StudentHero;
