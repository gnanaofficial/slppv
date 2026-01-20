import React, { useState, useEffect, useRef } from "react";
// Using a placeholder devotional sound or user-provided asset if available.
// For now, using a copyright-free devotional/calm instrumental.
import slogan from "../../assets/music/slogan.mp3";
const AUDIO_URL = slogan;

const MusicPlayer = ({ shouldPlay }) => {
  const audioRef = useRef(new Audio(AUDIO_URL));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    const attemptPlay = () => {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          // Remove listener once successful
          document.removeEventListener("click", attemptPlay);
        })
        .catch((error) => {
          console.log("Autoplay prevented:", error);
        });
    };

    if (shouldPlay) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.log(
              "Autoplay prevented by browser, waiting for interaction:",
              error,
            );
            setIsPlaying(false);
            // Add interaction listener
            document.addEventListener("click", attemptPlay);
          });
      }
    }

    return () => {
      audioRef.current.pause();
      document.removeEventListener("click", attemptPlay);
    };
  }, [shouldPlay]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  if (!shouldPlay) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex gap-2">
      <button
        onClick={toggleMute}
        className="bg-mainColor text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition"
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <span role="img" aria-label="muted">
            🔇
          </span>
        ) : (
          <span role="img" aria-label="unmuted">
            🔊
          </span>
        )}
      </button>
    </div>
  );
};

export default MusicPlayer;
