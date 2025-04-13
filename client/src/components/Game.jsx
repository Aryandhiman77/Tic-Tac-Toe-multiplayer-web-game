import { useEffect, useState } from 'react';
import socket from '../socket';

function Game({ roomId, player,roomType }) {
  const [board, setBoard] = useState(Array(9).fill(''));
  const [turn, setTurn] = useState('Player1');
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    socket.on('updateBoard', (updatedBoard) => {
      setBoard(updatedBoard);
      setTurn((prevTurn) => (prevTurn === 'Player1' ? 'Player2' : 'Player1'));
    });

    return () => {
      socket.off('updateBoard');
    };
  }, []);

  const checkWinner = (board) => {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    for (let [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const handleClick = (index) => {
    if (board[index] !== '' || winner || turn !== player) return;

    const newBoard = [...board];
    newBoard[index] = player === 'Player1' ? 'X' : 'O';
    const win = checkWinner(newBoard);
    if (win) setWinner(win);

    socket.emit('makeMove', { roomId, board: newBoard });
  };

  return (
    <div>
      <h2>Room ID: {roomId}</h2>
      <h3>{winner ? `Winner: ${winner}` : `Turn: ${turn} (${turn === 'Player1' ? 'X' : 'O'})`}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 100px)', margin: '20px auto' }}>
        {board.map((cell, idx) => (
          <div
            key={idx}
            onClick={() => handleClick(idx)}
            style={{
              width: '100px',
              height: '100px',
              border: '1px solid black',
              fontSize: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: board[idx] === '' && turn === player && !winner ? 'pointer' : 'default',
              backgroundColor: board[idx] !== '' ? '#f0f0f0' : '#fff'
            }}
          >
            {cell}
          </div>
        ))}
      </div>
      {winner && <button onClick={() => window.location.reload()}>Restart</button>}
    </div>
  );
}

export default Game;
