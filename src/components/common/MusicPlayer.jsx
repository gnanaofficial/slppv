import React, { useState, useEffect, useRef } from "react";
import { getSiteSettings } from "../../lib/configService";
// Fallback to local asset if no URL configured
import slogan from "../../assets/music/slogan.mp3";

const MusicPlayer = ({ shouldPlay }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [musicConfig, setMusicConfig] = useState({
    enabled: true,
    volume: 0.5,
    url: slogan,
  });

  // Load music configuration from Firestore
  useEffect(() => {
    const loadMusicConfig = async () => {
      try {
        const settings = await getSiteSettings();
        setMusicConfig({
          enabled: settings.musicEnabled ?? true,
          volume: settings.musicVolume ?? 0.5,
          url: settings.musicUrl || slogan, // Fallback to local file
        });
      } catch (error) {
        console.error("Error loading music config:", error);
        // Use defaults on error
      }
    };

    loadMusicConfig();
  }, []);

  // Initialize audio when config is loaded
  useEffect(() => {
    if (musicConfig.url) {
      audioRef.current = new Audio(musicConfig.url);
      audioRef.current.loop = true;
      audioRef.current.volume = musicConfig.volume;
    }
  }, [musicConfig.url, musicConfig.volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !musicConfig.enabled) return;

    // Check if music was muted before (from localStorage)
    const wasMuted = localStorage.getItem("musicMuted") === "true";
    setIsMuted(wasMuted);
    audio.muted = wasMuted;

    const attemptPlay = () => {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          localStorage.setItem("musicPlaying", "true");
          // Remove listener once successful
          document.removeEventListener("click", attemptPlay);
        })
        .catch((error) => {
          console.log("Autoplay prevented:", error);
        });
    };

    if (shouldPlay) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            localStorage.setItem("musicPlaying", "true");
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
      if (audio) {
        audio.pause();
      }
      document.removeEventListener("click", attemptPlay);
    };
  }, [shouldPlay, musicConfig.enabled]);

  const toggleMute = () => {
    if (!audioRef.current) return;

    const newMutedState = !isMuted;
    audioRef.current.muted = newMutedState;
    setIsMuted(newMutedState);
    localStorage.setItem("musicMuted", newMutedState.toString());
  };

  // Don't render if music is disabled or shouldn't play
  if (!shouldPlay || !musicConfig.enabled) return null;

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
