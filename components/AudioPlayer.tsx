import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Commodity } from '../types';

interface AudioPlayerProps {
  audioUrl: string;
  commodity: Commodity;
  onError: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, commodity, onError }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isReady, setIsReady] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationFrameRef = useRef<number>(0);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const updateProgress = useCallback(() => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }
  }, []);

  const handlePlayPause = () => {
    if (!isReady) return;
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      cancelAnimationFrame(animationFrameRef.current);
    } else {
      audio.play().catch(onError);
      setIsPlaying(true);
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isReady) return;
    const audio = audioRef.current;
    if (audio) {
      const seekTime = parseFloat(event.target.value);
      audio.currentTime = seekTime;
      setProgress(seekTime);
    }
  };
  
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setIsReady(true);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      if(audio) {
        audio.currentTime = 0;
      }
      cancelAnimationFrame(animationFrameRef.current);
    };

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', onError);
    
    // Auto-play when a new commodity is selected
    const playPromise = audio.play();
    if(playPromise !== undefined) {
        playPromise.then(() => {
            setIsPlaying(true);
            animationFrameRef.current = requestAnimationFrame(updateProgress);
        }).catch(() => {
            // Autoplay was prevented. User will have to click play.
            setIsPlaying(false);
        })
    }


    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', onError);
    };
  }, [audioUrl, onError, updateProgress]);

  return (
    <div className="w-full max-w-md p-4 bg-slate-50 rounded-xl shadow-inner animate-fade-in">
        <div className="flex items-center mb-4">
            <div className="text-4xl mr-4">{commodity.emoji}</div>
            <div>
                <h3 className="text-lg font-bold text-gray-800">Flash {commodity.name}</h3>
                <p className="text-xs text-gray-500">Mis à jour le: {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
        </div>

        {/* The actual audio element is hidden and controlled by our UI */}
        <audio ref={audioRef} src={audioUrl} preload="metadata"></audio>

        <div className="flex items-center gap-3">
            <button 
              onClick={handlePlayPause} 
              disabled={!isReady}
              className="p-2.5 bg-red-600 rounded-full text-white hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-slate-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {isPlaying ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z"></path></svg>
                ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4.516 2.84A2 2 0 0 0 2 4.618v10.764a2 2 0 0 0 3.016 1.732l8.832-5.382a2 2 0 0 0 0-3.464L5.016 2.84z"></path></svg>
                )}
            </button>
            <div className="flex-grow flex items-center gap-2">
                <span className="text-xs text-gray-500 w-10 text-center">{formatTime(progress)}</span>
                <input
                    type="range"
                    min="0"
                    max={duration}
                    value={progress}
                    onChange={handleSeek}
                    disabled={!isReady}
                    className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-red-500 disabled:accent-gray-400"
                />
                <span className="text-xs text-gray-500 w-10 text-center">{formatTime(duration)}</span>
            </div>
        </div>
    </div>
  );
};