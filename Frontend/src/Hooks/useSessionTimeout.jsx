import { useEffect, useState } from 'react';
import axios from 'axios';

const useSessionTimeout = () => {

  const [sessionExpired, setSessionExpired] = useState(false);

  
    const checkSession = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/check-session', { withCredentials: true });
        if (!response.data.isActive) {
          setSessionExpired(true);  // Session expired, set state to true
          await axios.post('http://localhost:5001/api/logout', {}, { withCredentials: true });
        }
        else{
          setSessionExpired(false);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setSessionExpired(true);  // Session expired, handle errors by marking it as expired
        await axios.post('http://localhost:5001/api/logout', {}, { withCredentials: true });
      }
    };
    useEffect(() => {
    // Check session every 1 minute
    const interval = setInterval(checkSession,  1 * 60 * 1000);
    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  return {sessionExpired, checkSession}; // Return sessionExpired state so that the component can render the UI
};

export default useSessionTimeout;
