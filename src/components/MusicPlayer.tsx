import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: 'Neon Drift',
    artist: 'AI Synthwave',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    cover: 'https://picsum.photos/seed/neon1/200/200?blur=2',
  },
  {
    id: 2,
    title: 'Cybernetic Pulse',
    artist: 'Neural Network',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    cover: 'https://picsum.photos/seed/cyber2/200/200?blur=2',
  },
  {
    id: 3,
    title: 'Digital Horizon',
    artist: 'Algorithm',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    cover: 'https://picsum.photos/seed/horizon3/200/200?blur=2',
  },
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.error("Audio playback failed:", err);
        setIsPlaying(false);
      });
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleTrackEnded = () => {
    handleNext();
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    if (audioRef.current) {
      audioRef.current.currentTime = (newProgress / 100) * audioRef.current.duration;
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  return (
    <div id="music-player-card" className="flex flex-col w-full max-w-sm bg-black/60 backdrop-blur-xl rounded-3xl border border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.1)] overflow-hidden">
      <audio
        id="audio-element"
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnded}
      />

      <div id="player-header" className="relative p-6 pb-0">
        <div id="now-playing-indicator" className="flex items-center justify-between mb-6">
          <span id="now-playing-text" className="text-xs font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
            <Music size={14} className="animate-pulse" /> Now Playing
          </span>
          <div id="track-dots" className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                id={`track-dot-${i}`}
                className={`w-1.5 h-1.5 rounded-full ${
                  i === currentTrackIndex ? 'bg-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.8)]' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        <div id="cover-art-container" className="relative group rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] aspect-square mb-6">
          <img
            id="cover-art-image"
            src={currentTrack.cover}
            alt={currentTrack.title}
            className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`}
            referrerPolicy="no-referrer"
          />
          <div id="cover-art-overlay" className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          {isPlaying && (
            <div id="playing-animation-overlay" className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 mix-blend-screen">
              <div id="ping-circle" className="w-full h-full border-4 border-cyan-400 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
            </div>
          )}
        </div>

        <div id="track-info" className="text-center mb-6">
          <h3 id="track-title" className="text-2xl font-bold text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] mb-1">
            {currentTrack.title}
          </h3>
          <p id="track-artist" className="text-sm font-mono text-gray-400 uppercase tracking-wider">
            {currentTrack.artist}
          </p>
        </div>
      </div>

      <div id="player-controls" className="px-6 pb-6">
        <div id="progress-container" className="mb-6 group">
          <input
            id="progress-slider"
            type="range"
            min="0"
            max="100"
            value={progress || 0}
            onChange={handleProgressChange}
            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500 hover:accent-cyan-400 transition-all"
          />
        </div>

        <div id="playback-buttons" className="flex items-center justify-between mb-6">
          <button
            id="prev-track-btn"
            onClick={handlePrev}
            className="p-3 text-gray-400 hover:text-cyan-400 transition-colors rounded-full hover:bg-cyan-400/10"
          >
            <SkipBack size={24} />
          </button>
          
          <button
            id="play-pause-btn"
            onClick={togglePlayPause}
            className="p-4 bg-gradient-to-br from-cyan-500 to-fuchsia-600 text-white rounded-full shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-105 transition-all duration-300"
          >
            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          </button>
          
          <button
            id="next-track-btn"
            onClick={handleNext}
            className="p-3 text-gray-400 hover:text-fuchsia-400 transition-colors rounded-full hover:bg-fuchsia-400/10"
          >
            <SkipForward size={24} />
          </button>
        </div>

        <div id="volume-controls" className="flex items-center gap-3 px-2">
          <button id="mute-btn" onClick={toggleMute} className="text-gray-500 hover:text-cyan-400 transition-colors">
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            id="volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>
      </div>
    </div>
  );
}
