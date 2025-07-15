import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketProvider';
import peer from '../service/peer';
import './RoomPage.css';

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(new MediaStream());

  const videoRef = useRef();
  const remoteVideoRef = useRef();

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`${email} joined`);
    setRemoteSocketId(id);
  }, []);

  const handleTrack = useCallback(event => {
    console.log('Received remote tracks');
    const [stream] = event.streams;
    setRemoteStream(stream);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener('track', handleTrack);
    return () => {
      peer.peer.removeEventListener('track', handleTrack);
    };
  }, [handleTrack]);

const handleNegoNeeded = useCallback(async () => {
  if (peer.peer.signalingState !== 'stable') {
    console.warn('Negotiation skipped: not stable');
    return;
  }

  try {
    const offer = await peer.getOffer();
    socket.emit('peer:nego:needed', { offer, to: remoteSocketId });
  } catch (err) {
    console.error('Negotiation error:', err);
  }
}, [remoteSocketId, socket]);


  useEffect(() => {
    peer.peer.addEventListener('negotiationneeded', handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

const handleCallUser = useCallback(async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    setMyStream(stream);
    peer.addTracks(stream);

    const offer = await peer.getOffer();
    socket.emit('user:call', { offer, to: remoteSocketId });
  } catch (err) {
    console.error('Error accessing media devices:', err);
  }
}, [remoteSocketId, socket]);

const handleIncomingCall = useCallback(async ({ from, offer }) => {
  setRemoteSocketId(from);
  console.log('Incoming call from:', from);

  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  setMyStream(stream);

  peer.addTracks(stream);

  const answer = await peer.getAnswer(offer);
  socket.emit('call:accepted', { to: from, answer });
}, [socket]);


  const handleCallAccepted = useCallback(async ({ from, answer }) => {
    if (!answer?.type) {
      console.error('Invalid answer received:', answer);
      return;
    }
    try {
      await peer.setRemoteDescription(answer);
      console.log('Call accepted from:', from);
    } catch (err) {
      console.error('Error setting remote description:', err);
    }
  }, []);

  const handleNegoNeedIncoming = useCallback(async ({ from, offer }) => {
    try {
      const answer = await peer.getAnswer(offer);
      socket.emit('peer:nego:done', { to: from, answer });
    } catch (err) {
      console.error('Error during negotiation:', err);
    }
  }, [socket]);

  const handleNegoNeedFinal = useCallback(async ({ answer }) => {
    try {
      await peer.setRemoteDescription(answer);
    } catch (err) {
      console.error('Error applying final negotiation:', err);
    }
  }, []);

  useEffect(() => {
    socket.on('user:joined', handleUserJoined);
    socket.on('incoming:call', handleIncomingCall);
    socket.on('call:accepted', handleCallAccepted);
    socket.on('peer:nego:needed', handleNegoNeedIncoming);
    socket.on('peer:nego:final', handleNegoNeedFinal);

    return () => {
      socket.off('user:joined', handleUserJoined);
      socket.off('incoming:call', handleIncomingCall);
      socket.off('call:accepted', handleCallAccepted);
      socket.off('peer:nego:needed', handleNegoNeedIncoming);
      socket.off('peer:nego:final', handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncoming,
    handleNegoNeedFinal,
  ]);

  useEffect(() => {
    if (videoRef.current && myStream) videoRef.current.srcObject = myStream;
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
  }, [myStream, remoteStream]);

return (
  <div className="room-container">
    <div className="status-bar">
      <div>Room Page</div>
      <div>Status: {remoteSocketId ? '✅ Connected' : '🕒 Waiting...'}</div>
    </div>

    <div className="controls">
      {remoteSocketId && <button onClick={handleCallUser}>📞 Call User</button>}
    </div>

    <div className="video-wrapper">
      {myStream && (
        <div className="video-box">
          <h2>My Camera</h2>
          <video ref={videoRef} autoPlay muted playsInline />
        </div>
      )}
      <div className="video-box">
        <h2>Remote Camera</h2>
        <video ref={remoteVideoRef} autoPlay playsInline />
      </div>
    </div>
  </div>
);

};

export default RoomPage;
