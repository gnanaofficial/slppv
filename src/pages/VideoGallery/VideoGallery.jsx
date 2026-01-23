import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Container } from "@mui/material";
import SEO from "../../components/common/SEO";
import LazyVideo from "../../components/common/LazyVideo";
import { getAllVideos } from "../../lib/firestoreService";

const VideoGallery = () => {
  const { t } = useTranslation();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const items = await getAllVideos();
      // Filter only video_gallery category for this page
      const galleryVideos = items.filter(
        (item) => item.category === "video_gallery" || !item.category,
      );
      setVideos(galleryVideos);
    } catch (error) {
      console.error("Error loading videos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter videos based on search
  const filteredVideos = videos.filter((video) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      video.title?.en?.toLowerCase().includes(query) ||
      video.title?.te?.toLowerCase().includes(query) ||
      video.eventTag?.toLowerCase().includes(query) ||
      video.description?.en?.toLowerCase().includes(query)
    );
  });

  const openVideo = (video) => {
    setSelectedVideo(video);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="bg-[#FAAC2F] min-h-screen py-8">
      <SEO
        title="Video Gallery"
        description="Watch videos from Sri Lakshmi Padmavathi Temple events and celebrations"
        keywords="Video Gallery, Temple Videos, Events, Celebrations"
      />

      <Container maxWidth="xl" className="bg-white p-8 rounded-lg shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-mainColor mb-4 font-play">
            Video Gallery
          </h1>
          <div className="h-2 w-32 bg-mainColor mx-auto rounded"></div>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-mainColor focus:ring-2 focus:ring-mainColor focus:outline-none"
            placeholder="Search videos by title, event, or description..."
          />
        </div>

        {/* Results Count */}
        {searchQuery && (
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredVideos.length} of {videos.length} videos
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-mainColor mx-auto mb-4"></div>
              <p className="text-gray-600">Loading videos...</p>
            </div>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              {searchQuery ? "No videos match your search" : "No videos found"}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Videos will appear here once uploaded by the admin
            </p>
          </div>
        ) : (
          <>
            {/* Video Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  className="group bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => openVideo(video)}
                >
                  <div className="relative">
                    <LazyVideo
                      src={video.url}
                      className="w-full h-48"
                      controls={false}
                      muted
                    />

                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-50 transition">
                      <svg
                        className="w-16 h-16 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  <div className="p-4">
                    {video.eventTag && (
                      <span className="inline-block bg-mainColor text-white text-xs px-2 py-1 rounded mb-2">
                        {video.eventTag}
                      </span>
                    )}
                    {video.uploadDate && (
                      <p className="text-xs text-gray-500 mb-2">
                        📅 {new Date(video.uploadDate).toLocaleDateString()}
                      </p>
                    )}
                    <h3 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2">
                      {video.title?.en || "Untitled"}
                    </h3>
                    {video.description?.en && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {video.description.en}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Video Modal */}
        {selectedVideo && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={closeVideo}
          >
            <button
              className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 z-10"
              onClick={closeVideo}
            >
              ×
            </button>

            <div
              className="max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                src={selectedVideo.url}
                controls
                autoPlay
                className="w-full max-h-[80vh] rounded-lg"
              />

              <div className="mt-4 text-white">
                {selectedVideo.eventTag && (
                  <span className="inline-block bg-mainColor px-3 py-1 rounded mb-2">
                    {selectedVideo.eventTag}
                  </span>
                )}
                <h2 className="text-2xl font-bold mb-2">
                  {selectedVideo.title?.en || "Untitled"}
                </h2>
                {selectedVideo.description?.en && (
                  <p className="text-gray-300">
                    {selectedVideo.description.en}
                  </p>
                )}
                {selectedVideo.uploadDate && (
                  <p className="text-sm text-gray-400 mt-2">
                    {new Date(selectedVideo.uploadDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default VideoGallery;
