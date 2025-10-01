import React, { useState, useCallback } from 'react';
import Game from './components/Game';
import type { GameStatus } from './types';

const SoundIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
  </svg>
);

const ConfigIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);


const App: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<GameStatus>('menu');
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [winner, setWinner] = useState<string | null>(null);

  const handleGameOver = useCallback((finalScores: { player1: number; player2: number }) => {
    setScores(finalScores);
    if (finalScores.player1 > finalScores.player2) {
      setWinner('Player 1');
    } else if (finalScores.player2 > finalScores.player1) {
      setWinner('Player 2');
    } else {
      setWinner('It\'s a Tie!');
    }
    setGameStatus('gameOver');
  }, []);

  const handleRestart = () => {
    setScores({ player1: 0, player2: 0 });
    setWinner(null);
    setGameStatus('playing');
  };

  const renderContent = () => {
    switch (gameStatus) {
      case 'playing':
        return <Game onGameOver={handleGameOver} />;
      case 'gameOver':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-black bg-opacity-70 text-white p-8 rounded-xl shadow-2xl" style={{fontFamily: "'VT323', monospace"}}>
            <h2 className="text-6xl font-extrabold text-yellow-400 mb-4" style={{fontFamily: "'Press Start 2P', cursive"}}>Game Over</h2>
            {winner && <p className="text-4xl mb-6 animate-pulse">{winner === "It's a Tie!" ? winner : `${winner} Wins!`}</p>}
            <div className="text-3xl mb-8 space-y-2 text-center">
              <p>Player 1 (WASD): <span className="font-bold text-green-400">{scores.player1}</span> points</p>
              <p>Player 2 (Arrows): <span className="font-bold text-blue-400">{scores.player2}</span> points</p>
            </div>
            <button
              onClick={handleRestart}
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 text-2xl"
               style={{fontFamily: "'Press Start 2P', cursive"}}
            >
              Play Again
            </button>
          </div>
        );
      case 'menu':
      default:
        return (
            <div 
                className="w-full h-full flex flex-col items-center justify-center p-4 overflow-hidden relative bg-gray-800"
                style={{
                    fontFamily: "'VT323', monospace"
                }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-60 bg-gradient-to-t from-gray-900 via-transparent to-gray-900"></div>
                
                <div className="absolute top-4 right-4 flex gap-3 z-10">
                    <button className="p-3 bg-gray-700/50 hover:bg-purple-600 rounded-full text-white transition-colors" aria-label="Toggle Sound"><SoundIcon /></button>
                    <button className="p-3 bg-gray-700/50 hover:bg-purple-600 rounded-full text-white transition-colors" aria-label="Settings"><ConfigIcon /></button>
                </div>

                <div className="relative z-10 text-center flex flex-col items-center">
                    <h1 className="text-8xl md:text-9xl text-white mb-2" style={{ fontFamily: "'Press Start 2P', cursive", textShadow: '6px 6px 0px #9f00a1' }}>
                        Pixel
                    </h1>
                    <h1 className="text-8xl md:text-9xl text-yellow-400 -mt-8 mb-6" style={{ fontFamily: "'Press Start 2P', cursive", textShadow: '6px 6px 0px #9f00a1' }}>
                        Racer
                    </h1>

                    <p className="text-2xl text-gray-300 mb-10 max-w-xl">Dodge obstacles, grab coins, and race to the top score against a friend!</p>

                    <button
                    onClick={() => setGameStatus('playing')}
                    className="px-12 py-5 mb-10 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-bold text-3xl rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 animate-bounce"
                    style={{ fontFamily: "'Press Start 2P', cursive" }}
                    >
                        PLAY
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xl w-full max-w-3xl bg-black/30 p-6 rounded-lg backdrop-blur-sm border border-gray-700">
                        <div className="p-4 border-2 border-green-400 rounded-lg text-left">
                            <h3 className="font-bold text-2xl text-green-400 mb-2" style={{ fontFamily: "'Press Start 2P', cursive" }}>Player 1</h3>
                            <p><span className="font-bold text-yellow-400">W/S:</span> Change Lane</p>
                            <p><span className="font-bold text-yellow-400">A/D:</span> Move Left/Right</p>
                        </div>
                        <div className="p-4 border-2 border-blue-400 rounded-lg text-left">
                            <h3 className="font-bold text-2xl text-blue-400 mb-2" style={{ fontFamily: "'Press Start 2P', cursive" }}>Player 2</h3>
                            <p><span className="font-bold text-yellow-400">↑/↓:</span> Change Lane</p>
                            <p><span className="font-bold text-yellow-400">←/→:</span> Move Left/Right</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-full max-w-6xl aspect-video relative shadow-2xl rounded-lg overflow-hidden bg-gray-800">
            {renderContent()}
        </div>
    </main>
  );
};

export default App;