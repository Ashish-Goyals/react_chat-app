import React, {useContext, useMemo} from 'react';
const SocketContext = React.createContext (null);
import {io} from 'socket.io-client';

export const useSocket = () => {
  const socket = useContext (SocketContext);
  if (!socket) {
    throw new Error ('useSocket must be used within a SocketProvider');
  }
  return socket;
};

export const SocketProvider = props => {
  const socket = useMemo (() => io ('localhost:8000'), []);
  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};
