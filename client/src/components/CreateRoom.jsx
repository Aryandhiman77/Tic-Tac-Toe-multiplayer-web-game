import { useEffect, useState } from 'react';
import socket from '../socket';

function CreateRoom({ setRoomId, setStep, setPlayer }) {
  const [localRoomId, setLocalRoomId] = useState('');

  useEffect(() => {
    socket.emit('createRoom', (roomId) => {
      setRoomId(roomId);
      setLocalRoomId(roomId); // save in local state to display
      setPlayer('Player1');
    });

    socket.on('playerJoined', () => {
      setStep('chat');
    });

    return () => socket.off('playerJoined');
  }, []);

  return (
    <div>
      <h2>Room Created!</h2>
      {localRoomId ? (
        <>
          <p><strong>Room ID:</strong> {localRoomId}</p>
          <p>Share this Room ID with your friend to join.</p>
        </>
      ) : (
        <p>Creating room...</p>
      )}
    </div>
  );
}

export default CreateRoom;
