import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, X } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
}

interface SpotifyMusicBoxProps {
  isVisible: boolean;
  onClose: () => void;
}

const SpotifyMusicBox: React.FC<SpotifyMusicBoxProps> = ({ isVisible, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const tracks: Track[] = [
    {
      id: '1',
      title: 'Sugar Crash',
      artist: 'Elyotto',
      url: '/media/Elyotto -sugar crash (slowed and pitched TikTok version).mp3'
    },
    {
      id: '2',
      title: 'I Love You So',
      artist: 'Schnuffel',
      url: '/media/schnuffel - I LOVE YOU SO (Slowed  Reverb).mp3'
    }
  ];

  const handleNext = () => {
    const audio = audioRef.current;
    const wasPlaying = isPlaying;
    
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
    
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
    
    // If music was playing, continue playing the next track after a short delay
    if (wasPlaying) {
      setTimeout(() => {
        const newAudio = audioRef.current;
        if (newAudio && newAudio.readyState >= 2) {
          newAudio.play().then(() => {
            setIsPlaying(true);
          }).catch(() => {
            setIsPlaying(false);
          });
        }
      }, 300);
    }
  };

  const handlePrev = () => {
    const audio = audioRef.current;
    const wasPlaying = isPlaying;
    
    if (audio) {
      audio.pause();
      setIsPlaying(false);
    }
    
    setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length);
    
    // If music was playing, continue playing the previous track after a short delay
    if (wasPlaying) {
      setTimeout(() => {
        const newAudio = audioRef.current;
        if (newAudio && newAudio.readyState >= 2) {
          newAudio.play().then(() => {
            setIsPlaying(true);
          }).catch(() => {
            setIsPlaying(false);
          });
        }
      }, 300);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const handleCanPlay = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const handleDurationChange = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      handleNext();
    };

    // Clear all previous listeners
    audio.removeEventListener('timeupdate', handleTimeUpdate);
    audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    audio.removeEventListener('canplay', handleCanPlay);
    audio.removeEventListener('durationchange', handleDurationChange);
    audio.removeEventListener('ended', handleEnded);

    // Reset states for new track
    setCurrentTime(0);
    setDuration(0);

    // Add event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    // Load the new track
    audio.load();

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  // Auto-play when music box becomes visible (only once)
  useEffect(() => {
    if (isVisible && !hasAutoPlayed && audioRef.current) {
      const audio = audioRef.current;
      
      const playWhenReady = () => {
        audio.play().then(() => {
          setIsPlaying(true);
          setHasAutoPlayed(true);
        }).catch((error) => {
          console.log('Auto-play failed:', error);
          setIsPlaying(false);
        });
      };

      // Wait for the audio to be ready
      const checkAndPlay = () => {
        if (audio.readyState >= 2) { // HAVE_CURRENT_DATA or higher
          playWhenReady();
        } else {
          // Wait for canplay event
          const handleCanPlay = () => {
            playWhenReady();
            audio.removeEventListener('canplay', handleCanPlay);
          };
          audio.addEventListener('canplay', handleCanPlay);
          
          // Fallback timeout
          setTimeout(() => {
            audio.removeEventListener('canplay', handleCanPlay);
            if (audio.readyState >= 1) { // At least HAVE_METADATA
              playWhenReady();
            }
          }, 2000);
        }
      };

      // Small delay to ensure the audio element is updated
      setTimeout(checkAndPlay, 200);
    }
  }, [isVisible, hasAutoPlayed]);

  // Reset playing state when component becomes invisible
  useEffect(() => {
    if (!isVisible && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isVisible]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.log('Play failed:', error);
        setIsPlaying(false);
      });
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentTrackData = tracks[currentTrack];

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-pink-50/95 backdrop-blur-md rounded-xl shadow-lg border border-pink-200/70 p-3 w-64">
        <audio ref={audioRef} src={currentTrackData?.url} />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-pink-700">Now Playing</span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 bg-pink-100 hover:bg-pink-200 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-3 h-3 text-pink-600" />
          </button>
        </div>

        {/* Cassette Animation */}
        <div className="flex items-center justify-center mb-3">
          <div className="relative">
            <div className="w-24 h-16 bg-gradient-to-r from-pink-200 to-pink-300 rounded-lg relative overflow-hidden border-2 border-pink-300">
              {/* Cassette Body */}
              <div className="absolute inset-2 bg-pink-50 rounded"></div>
              
              {/* Spinning Reels */}
              <div className="absolute top-2 left-3 w-4 h-4 bg-pink-400 rounded-full flex items-center justify-center">
                <div 
                  className={`w-3 h-3 bg-pink-300 rounded-full ${isPlaying ? 'animate-spin' : ''}`}
                  style={{ animation: isPlaying ? 'spin 2s linear infinite' : 'none' }}
                >
                  <div className="w-full h-full bg-gradient-to-r from-pink-200 to-pink-400 rounded-full flex items-center justify-center">
                    <div className="w-0.5 h-0.5 bg-pink-100 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-2 right-3 w-4 h-4 bg-pink-400 rounded-full flex items-center justify-center">
                <div 
                  className={`w-3 h-3 bg-pink-300 rounded-full ${isPlaying ? 'animate-spin' : ''}`}
                  style={{ animation: isPlaying ? 'spin 2s linear infinite reverse' : 'none' }}
                >
                  <div className="w-full h-full bg-gradient-to-r from-pink-200 to-pink-400 rounded-full flex items-center justify-center">
                    <div className="w-0.5 h-0.5 bg-pink-100 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Tape */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-0.5 bg-pink-400 opacity-60"></div>
              
              {/* Label */}
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-pink-100 px-1.5 py-0.5 rounded text-xs font-mono text-pink-700">
                💕 LOVE MIX 💕
              </div>
            </div>
            
            {/* Floating music notes */}
            {isPlaying && (
              <>
                <div className="absolute -top-2 -right-2 text-pink-300 animate-bounce" style={{ animationDelay: '0s' }}>♪</div>
                <div className="absolute -top-4 left-1/2 text-pink-400 animate-bounce" style={{ animationDelay: '0.5s' }}>♫</div>
                <div className="absolute -top-2 -left-2 text-pink-200 animate-bounce" style={{ animationDelay: '1s' }}>♪</div>
              </>
            )}
          </div>
        </div>

        {/* Track Info */}
        <div className="text-center mb-3">
          <h3 className="font-bold text-pink-800 text-base mb-1">{currentTrackData?.title}</h3>
          <p className="text-pink-600 text-xs">{currentTrackData?.artist}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div 
            className="w-full bg-pink-100 rounded-full h-1.5 cursor-pointer relative overflow-hidden"
            onClick={handleSeek}
          >
            <div 
              className="bg-gradient-to-r from-pink-300 to-pink-400 h-1.5 rounded-full transition-all duration-100 relative"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            >
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-pink-50 rounded-full shadow-sm"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-pink-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-3 mb-2">
          <button
            onClick={handlePrev}
            className="w-8 h-8 bg-pink-100 hover:bg-pink-200 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
          >
            <SkipBack className="w-4 h-4 text-pink-600" />
          </button>
          
          <button
            onClick={togglePlay}
            className="w-10 h-10 bg-gradient-to-r from-pink-300 to-pink-400 hover:from-pink-400 hover:to-pink-500 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-sm"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-pink-50" />
            ) : (
              <Play className="w-5 h-5 text-pink-50 ml-0.5" />
            )}
          </button>
          
          <button
            onClick={handleNext}
            className="w-8 h-8 bg-pink-100 hover:bg-pink-200 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
          >
            <SkipForward className="w-4 h-4 text-pink-600" />
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <Volume2 className="w-3 h-3 text-pink-500" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-1 bg-pink-100 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, rgb(244, 114, 182) 0%, rgb(244, 114, 182) ${volume * 100}%, rgb(252, 231, 243) ${volume * 100}%, rgb(252, 231, 243) 100%)`
            }}
          />
        </div>

        {/* Track List */}
        <div className="mt-3 pt-2 border-t border-pink-200">
          <p className="text-xs text-pink-400 mb-1">Playlist</p>
          <div className="space-y-1">
            {tracks.map((track, index) => (
              <button
                key={track.id}
                onClick={() => {
                  const audio = audioRef.current;
                  const wasPlaying = isPlaying;
                  
                  if (audio) {
                    audio.pause();
                  }
                  
                  // Reset states before changing track
                  setCurrentTime(0);
                  setDuration(0);
                  setIsPlaying(false);
                  setCurrentTrack(index);
                  
                  // If music was playing, continue playing the selected track
                  if (wasPlaying) {
                    setTimeout(() => {
                      const newAudio = audioRef.current;
                      if (newAudio && newAudio.readyState >= 2) {
                        newAudio.play().then(() => {
                          setIsPlaying(true);
                        }).catch(() => {
                          setIsPlaying(false);
                        });
                      }
                    }, 300);
                  }
                }}
                className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                  index === currentTrack 
                    ? 'bg-pink-200 text-pink-800' 
                    : 'text-pink-600 hover:bg-pink-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {index === currentTrack && isPlaying && (
                    <div className="flex space-x-0.5">
                      <div className="w-0.5 h-2 bg-pink-400 animate-pulse"></div>
                      <div className="w-0.5 h-1.5 bg-pink-400 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-0.5 h-3 bg-pink-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  )}
                  <span className="truncate">{track.title} - {track.artist}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotifyMusicBox;
