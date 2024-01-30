import React, { useState, useEffect } from 'react';

const App = () => {
  // State variables for managing playlist, current track, audio playback, and progress
  const [playlist, setPlaylist] = useState([]); // Array to store uploaded audio files
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0); // Index of the currently playing track
  const [audio, setAudio] = useState(new Audio()); // Audio element for playback
  const [isPlaying, setIsPlaying] = useState(false); // Boolean to track playback state
  const [progress, setProgress] = useState(0); // Playback progress in percentage
  const [uploadProgress, setUploadProgress] = useState(0); // Progress of file upload

  // Load saved playlist and current track from localStorage on component mount
  useEffect(() => {
    const savedPlaylist = JSON.parse(localStorage.getItem('playlist')) || [];
    const savedTrackIndex = parseInt(localStorage.getItem('currentTrackIndex'), 10) || 0;

    // Restore audio playback state if there's a track and it's a Blob/File object
    const track = savedPlaylist[savedTrackIndex];
    if (track instanceof Blob || track instanceof File) {
      audio.src = URL.createObjectURL(track);
      audio.play();
      setIsPlaying(true);
    } else {
      console.error("Invalid audio file object:", track);
    }
  }, [audio]);

  // Update localStorage when playlist or current track changes
  useEffect(() => {
    localStorage.setItem('playlist', JSON.stringify(playlist));
    localStorage.setItem('currentTrackIndex', currentTrackIndex.toString());
  }, [playlist, currentTrackIndex]);

  // Load new track when playlist or current track changes
  useEffect(() => {
    if (playlist.length > 0 && currentTrackIndex < playlist.length) {
      const track = playlist[currentTrackIndex];
      audio.src = URL.createObjectURL(track);
      if (isPlaying) {
        audio.play();
      }
    }
  }, [playlist, currentTrackIndex, audio, isPlaying]);

  // Toggle play/pause functionality
  const togglePlay = () => {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Handle track end to move to the next track in the playlist
  const handleEnded = () => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % playlist.length);
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const files = event.target.files;
    const filesArray = Array.from(files);

    if (filesArray.length > 0) {
      const progressInterval = setInterval(() => {
        setUploadProgress((prevProgress) => {
          const newProgress = prevProgress + 10;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
          }
          return newProgress;
        });
      }, 500);

      setTimeout(() => {
        setUploadProgress(0);
        setPlaylist((prevPlaylist) => [...prevPlaylist, ...filesArray]);
      }, 2000);
    }
  };

  // Handle click on a playlist item to change the current track
  const handlePlaylistItemClick = (index) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  // Update progress bar during playback
  useEffect(() => {
    const updateProgress = () => {
      const currentTime = audio.currentTime;
      const duration = audio.duration;
      const progressPercent = (currentTime / duration) * 100;
      setProgress(progressPercent);
    };

    audio.addEventListener('timeupdate', updateProgress);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
    };
  }, [audio]);

  // Save current audio position in localStorage before unload
  useEffect(() => {
    const handleUnload = () => {
      localStorage.setItem('audioPosition', audio.currentTime.toString());
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [audio]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-green-400 mb-8">Audio Player</h1>
      {/* File input for uploading audio files */}
      <input type="file" accept="audio/mp3" onChange={handleFileUpload} multiple className="mb-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600 focus:outline-none focus:bg-green-600 transition duration-300 ease-in-out" />
      {/* Display upload progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mb-4 w-full bg-gray-200 rounded overflow-hidden">
          <div className="bg-green-400 h-2" style={{ width: `${uploadProgress}%` }}></div>
        </div>
      )}
      {/* Display playlist */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2 text-green-400">Playlist</h2>
        <ul className="list-disc pl-4">
          {playlist.map((track, index) => (
            <li key={index} onClick={() => handlePlaylistItemClick(index)} className="cursor-pointer hover:underline text-green-600">
              {track.name}
            </li>
          ))}
        </ul>
      </div>
      {/* Display current track info and playback controls */}
      <div>
        <h2 className="text-xl font-semibold mb-2 text-green-400">Now Playing</h2>
        {playlist.length > 0 && (
          <div className="flex items-center">
            <p className="mr-4 text-green-600">{playlist[currentTrackIndex].name}</p>
            <button onClick={togglePlay} className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600 focus:outline-none focus:bg-green-600 transition duration-300 ease-in-out">
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            {/* Display playback progress */}
            <div className="w-full h-2 bg-gray-200 rounded mt-4">
              <div className="h-full bg-green-400" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}
      </div>
      {/* Audio element for playback */}
      <audio onEnded={handleEnded} ref={setAudio} />
    </div>
  );
};

export default App;






