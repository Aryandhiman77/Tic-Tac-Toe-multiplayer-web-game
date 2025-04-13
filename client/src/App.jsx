import { useState } from 'react';
import CreateRoom from './components/CreateRoom';
import JoinRoom from './components/JoinRoom';
import Chat from './components/Chat';
import Game from './components/Game';

function App() {
  const [step, setStep] = useState('menu');
  const [roomId, setRoomId] = useState('');
  const [player, setPlayer] = useState('');

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      {step === 'menu' && (
        <>
          <h1 style={{fontSize:"3rem",fontFamily:"fantasy"}}>Multiplayer Tic Tac Toe</h1>
          <button className='room-btn' onClick={() => setStep('create')}>Create Room</button>
          <button className='room-btn' onClick={() => setStep('join')}>Join Room</button>
        </>
      )}
      {step === 'create' && <CreateRoom setRoomId={setRoomId} setStep={setStep} setPlayer={setPlayer} />}
      {step === 'join' && <JoinRoom setRoomId={setRoomId} setStep={setStep} setPlayer={setPlayer} />}
      {step === 'chat' && <Chat roomId={roomId} setStep={setStep} setPlayer={setPlayer}/>}
      {step === 'game' && <Game roomId={roomId} player={player} />}
    </div>
  );
}

export default App;
