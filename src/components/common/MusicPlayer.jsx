import React, { useState, useEffect, useRef } from "react";
import { getSiteSettings } from "../../lib/configService";
// Fallback to local asset if no URL configured
import slogan from "../../assets/music/slogan.mp3";

const MusicPlayer = ({ shouldPlay }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

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

    // Reset muted state to ensure sound plays when playing
    audio.muted = false; const attemptPlay = () => {
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

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      localStorage.setItem("musicPlaying", "false");
    } else {
      audioRef.current.play().catch(e => console.error("Play failed:", e));
      setIsPlaying(true);
      localStorage.setItem("musicPlaying", "true");
    }
  };

  // Don't render if music is disabled or shouldn't play
  if (!shouldPlay || !musicConfig.enabled) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex gap-2">
      <button
        onClick={togglePlay}
        className="bg-mainColor text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition"
        title={isPlaying ? "Stop Music" : "Play Music"}
      >
        {isPlaying ? (
          <span role="img" aria-label="playing">
            🔊
          </span>
        ) : (
          <span role="img" aria-label="stopped">
            🔇
          </span>
        )}
      </button>
    </div>
  );
};

export default MusicPlayer;
