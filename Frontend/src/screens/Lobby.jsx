import React, {useState, useCallback, useEffect} from 'react';
import {useSocket} from '../context/SocketProvider.jsx';
import {useNavigate} from 'react-router-dom';
const LobbyScreen = () => {
  const [email, setEmail] = useState ('');
  const [room, setRoom] = useState ('');
  const socket = useSocket ();

  const navigate = useNavigate ();

  const handleJoinRoom = useCallback (
    data => {
      const {email, room} = data;
      navigate (`/room/${room}`);
      // console.log (email, room);
    },
    [navigate]
  );
  useEffect (
    () => {
      if (!socket) return;

      socket.on ('room join', handleJoinRoom);

      return () => socket.off ('room join', handleJoinRoom);
    },
    [socket, handleJoinRoom]
  );

  // console.log (socket);
  const handleSubmitForm = useCallback (
    e => {
      e.preventDefault ();
      // console.log (email, room);
      socket.emit ('room join', {email, room});
    },
    [email, room, socket]
  );

  return (
    <div>
      <h1>Lobby</h1>
      <form onSubmit={handleSubmitForm}>
        <label htmlFor="email">Email Id</label> &nbsp;
        <input
          type="email"
          id="email"
          value={email}
          onChange={e => setEmail (e.target.value)}
        />
        <br />
        <label htmlFor="room">Room Number</label> &nbsp;
        <input
          type="text"
          id="room"
          value={room}
          onChange={e => setRoom (e.target.value)}
        />
        <br />
        <button type="submit">Join</button>
      </form>
    </div>
  );
};

export default LobbyScreen;
