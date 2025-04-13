import { useState } from 'react';
import socket from '../socket';

function JoinRoom({ setRoomId, setStep, setPlayer }) {
  const [inputId, setInputId] = useState('');
  const [error, setError] = useState('');

  const handleJoin = () => {
    socket.emit('joinRoom', inputId, (response) => {
      if (response.success) {
        setRoomId(inputId);
        setPlayer('Player2');
        setStep('chat');
      } else {
        setError(response.message);
      }
    });
  };

  return (
    <div>
      <h2>Join Room</h2>
      <input
        placeholder="Enter Room ID"
        value={inputId}
        onChange={(e) => setInputId(e.target.value.toUpperCase())}
      />
      <button onClick={handleJoin}>Join</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default JoinRoom;
