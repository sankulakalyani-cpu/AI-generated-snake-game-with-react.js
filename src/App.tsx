import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  return (
    <div id="app-root" className="min-h-screen bg-gray-950 text-white font-sans overflow-hidden relative flex flex-col items-center justify-center p-4 gap-8">
      {/* Background neon effects */}
      <div id="bg-glow-fuchsia" className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-fuchsia-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div id="bg-glow-cyan" className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/20 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Grid pattern overlay */}
      <div 
        id="bg-grid-overlay"
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div id="main-content" className="relative z-10 flex flex-col items-center w-full max-w-7xl mx-auto gap-8">
        
        {/* Top: Title & Info */}
        <div id="title-section" className="flex flex-col items-center text-center">
          <h1 id="main-title" className="text-5xl md:text-7xl font-black text-fuchsia-400 tracking-tighter drop-shadow-[0_0_15px_rgba(217,70,239,0.8)] leading-[0.85] mb-2">
            NEON<br/>SNAKE
          </h1>
          <p id="subtitle" className="text-gray-400 font-mono text-sm tracking-widest uppercase opacity-80 mt-2">
            Retro arcade meets synthwave
          </p>
        </div>

        <div id="content-grid" className="flex flex-col xl:flex-row items-center justify-center gap-12 w-full">
          {/* Left: Info text */}
          <div id="info-section" className="hidden xl:flex xl:w-1/4 flex-col items-end text-right">
             <div id="info-divider" className="w-16 h-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500 rounded-full mb-6 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
             <p id="info-text" className="text-gray-500 text-sm max-w-xs leading-relaxed">
              Immerse yourself in the glowing grid. Eat the neon energy to grow, avoid the walls, and never cross your own path. Let the beats guide your rhythm.
            </p>
          </div>

          {/* Center: Game */}
          <div id="game-section" className="xl:w-2/4 flex justify-center">
            <SnakeGame />
          </div>

          {/* Right: Music Player */}
          <div id="music-player-section" className="xl:w-1/4 flex justify-center xl:justify-start">
            <MusicPlayer />
          </div>
        </div>

      </div>
    </div>
  );
}
