import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinRoom = (userId) => {
    if (socket) {
      socket.emit('join-room', userId);
    }
  };

  const onTaskUpdate = (callback) => {
    if (socket) {
      socket.on('task-updated', callback);
    }
  };

  const offTaskUpdate = (callback) => {
    if (socket) {
      socket.off('task-updated', callback);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, connected, joinRoom, onTaskUpdate, offTaskUpdate }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
