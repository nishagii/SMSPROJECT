
import './App.css';
import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import  { Toaster, toast } from 'react-hot-toast';

function App() {

  useEffect(() => {
    // Connect to the socket server
    const socket = io('http://localhost:5010', {
        auth: {
            token: localStorage.getItem('token'), // Send the token for authentication
        },
    });

    // Listen for socket events
    socket.on('connect', () => {
        toast.success('Connected to the server!');
    });

    socket.on('disconnect', () => {
        toast.error('Disconnected from the server.');
    });

    socket.on('new message', (message) => {
        toast(`New message: ${message.text}`, {
            icon: '✉️', // Add an icon for fun
        });
    });

    socket.on('error', (error) => {
        toast.error(`Error: ${error.message}`);
    });

    // Cleanup on unmount
    return () => {
        socket.disconnect();
    };
}, []);

  return (
   <> 
      <Toaster/>
       <main >
        <Outlet/>
       </main>
   </>
  );
}

export default App;