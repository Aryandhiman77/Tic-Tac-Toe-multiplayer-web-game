import { useEffect, useState } from 'react';
import socket from '../socket';

function Chat({ roomId, setStep,setPlayer }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [tossResult, setTossResult] = useState(null);

  useEffect(() => {
    socket.on('receiveMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('tossResult', (result) => {
      setTossResult(result);
      setPlayer(result)
      setTimeout(() => setStep('game'), 2000); // Move to game after toss
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('tossResult');
    };
  }, []);

  const sendMessage = () => {
    socket.emit('sendMessage', { roomId, message: input });
    setInput('');
  };

  const handleToss = () => {
    socket.emit('toss', { roomId });
  };

  return (
    <div>
      <h2>Room ID: {roomId}</h2>
      <div style={{ border: '1px solid gray', height: '200px', overflowY: 'scroll', margin: '10px 0' }}>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <input
        placeholder="Type a message"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
      <div style={{ marginTop: '20px' }}>
        <button onClick={handleToss}>Start Toss</button>
        {tossResult && <p>Toss Winner: {tossResult}</p>}
      </div>
    </div>
  );
}

export default Chat;
