import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

export const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        let newSocket;
        if (user) {
            newSocket = io(import.meta.env.VITE_BACKEND_URL, {
                withCredentials: true,
                autoConnect: true
            });

            setSocket(newSocket);

            // newSocket.on('connect', () => {
            //     console.log('Socket connected:', newSocket.id);
            // });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
            });

            // newSocket.on('disconnect', () => {
            //     console.log('Socket disconnected');
            // });
        }

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
