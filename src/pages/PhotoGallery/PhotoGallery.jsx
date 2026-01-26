import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Container } from "@mui/material";
import SEO from "../../components/common/SEO";
import LazyImage from "../../components/common/LazyImage";
import LazyVideo from "../../components/common/LazyVideo";
import { getAllGalleryItems, getAllVideos } from "../../lib/firestoreService";

const Gallery = () => {
  const { t } = useTranslation();
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // all, photos, videos
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid, list
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null); // 'image' or 'video'

  // Get unique event tags
  const [eventTags, setEventTags] = useState([]);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      setLoading(true);
      const [galleryItems, videoItems] = await Promise.all([
        getAllGalleryItems(),
        getAllVideos(),
      ]);

      // Filter only photo_gallery category
      const galleryImages = galleryItems.filter(
        (item) => item.category === "photo_gallery" || !item.category,
      );

      // Filter only video_gallery category
      const galleryVideos = videoItems.filter(
        (item) => item.category === "video_gallery" || !item.category,
      );

      setImages(galleryImages);
      setVideos(galleryVideos);

      // Extract unique event tags
      const allTags = [
        ...galleryImages.map((item) => item.eventTag).filter(Boolean),
        ...galleryVideos.map((item) => item.eventTag).filter(Boolean),
      ];
      const uniqueTags = [...new Set(allTags)].sort();
      setEventTags(uniqueTags);
    } catch (error) {
      console.error("Error loading gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter media based on active tab, search, and event
  const getFilteredMedia = () => {
    let media = [];

    if (activeTab === "all") {
      media = [
        ...images.map((img) => ({ ...img, type: "image" })),
        ...videos.map((vid) => ({ ...vid, type: "video" })),
      ];
    } else if (activeTab === "photos") {
      media = images.map((img) => ({ ...img, type: "image" }));
    } else if (activeTab === "videos") {
      media = videos.map((vid) => ({ ...vid, type: "video" }));
    }

    // Filter by event
    if (selectedEvent !== "all") {
      media = media.filter((item) => item.eventTag === selectedEvent);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      media = media.filter((item) => {
        const matchesCaption =
          item.caption?.en?.toLowerCase().includes(query) ||
          item.caption?.te?.toLowerCase().includes(query);
        const matchesTitle =
          item.title?.en?.toLowerCase().includes(query) ||
          item.title?.te?.toLowerCase().includes(query);
        const matchesTag = item.eventTag?.toLowerCase().includes(query);
        const matchesFileName = item.fileName?.toLowerCase().includes(query);

        return matchesCaption || matchesTitle || matchesTag || matchesFileName;
      });
    }

    // Sort by upload date (newest first)
    return media.sort((a, b) => {
      const dateA = a.uploadDate
        ? new Date(a.uploadDate)
        : new Date(a.createdAt?.toDate?.() || 0);
      const dateB = b.uploadDate
        ? new Date(b.uploadDate)
        : new Date(b.createdAt?.toDate?.() || 0);
      return dateB - dateA;
    });
  };

  const filteredMedia = getFilteredMedia();

  const openLightbox = (media, type) => {
    setSelectedMedia(media);
    setMediaType(type);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setSelectedMedia(null);
    setMediaType(null);
  };

  return (
    <div className="bg-[#FAAC2F] min-h-screen py-8">
      <SEO
        title="Gallery - Photos & Videos"
        description="View photos and videos from Sri Lakshmi Padmavathi Temple events and celebrations"
        keywords="Gallery, Temple Photos, Temple Videos, Events"
      />

      <Container maxWidth="xl" className="bg-white p-8 rounded-lg shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-mainColor mb-4 font-play">
            Gallery
          </h1>
          <div className="h-2 w-32 bg-mainColor mx-auto rounded"></div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === "all"
                ? "bg-mainColor text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All ({images.length + videos.length})
          </button>
          <button
            onClick={() => setActiveTab("photos")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === "photos"
                ? "bg-mainColor text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Photos ({images.length})
          </button>
          <button
            onClick={() => setActiveTab("videos")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeTab === "videos"
                ? "bg-mainColor text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Videos ({videos.length})
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-mainColor focus:outline-none"
              placeholder="Search by event, caption, or filename..."
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-mainColor focus:outline-none"
            >
              <option value="all">All Events</option>
              {eventTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex-1 p-2 rounded-lg ${
                viewMode === "grid" ? "bg-mainColor text-white" : "bg-gray-200"
              }`}
              title="Grid View"
            >
              <svg
                className="w-5 h-5 mx-auto"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex-1 p-2 rounded-lg ${
                viewMode === "list" ? "bg-mainColor text-white" : "bg-gray-200"
              }`}
              title="List View"
            >
              <svg
                className="w-5 h-5 mx-auto"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredMedia.length}{" "}
          {activeTab === "all" ? "items" : activeTab}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-mainColor mx-auto mb-4"></div>
              <p className="text-gray-600">Loading gallery...</p>
            </div>
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              {searchQuery || selectedEvent !== "all"
                ? "No items match your filters"
                : "No items found"}
            </p>
          </div>
        ) : (
          <>
            {/* Masonry Grid View */}
            {viewMode === "grid" && (
              <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 px-2">
                {filteredMedia.map((item) => (
                  <div
                    key={item.id}
                    className="break-inside-avoid mb-4 group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer bg-gray-100"
                    onClick={() => openLightbox(item, item.type)}
                  >
                    {item.type === "image" ? (
                      <LazyImage
                        src={item.url}
                        alt={item.caption?.en || item.fileName}
                        className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="relative w-full">
                        <LazyVideo
                          src={item.url}
                          className="w-full h-auto min-h-[200px] object-cover"
                          controls={false}
                          muted
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/50">
                            <svg
                              className="w-8 h-8 text-white"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Gradient Overlay - Visible on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      {item.eventTag && (
                        <span className="self-start bg-[#8B0000] text-white text-xs font-bold px-2 py-1 rounded mb-2 shadow-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                          {item.eventTag}
                        </span>
                      )}

                      <p className="text-white font-semibold text-lg leading-tight transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                        {item.caption?.en || item.title?.en || item.fileName}
                      </p>

                      {item.uploadDate && (
                        <p className="text-gray-300 text-xs mt-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-150">
                          📅 {new Date(item.uploadDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <div className="space-y-4">
                {filteredMedia.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-white border rounded-lg hover:shadow-md transition cursor-pointer"
                    onClick={() => openLightbox(item, item.type)}
                  >
                    <div className="w-32 h-24 flex-shrink-0">
                      {item.type === "image" ? (
                        <LazyImage
                          src={item.url}
                          alt={item.caption?.en || item.fileName}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          <LazyVideo
                            src={item.url}
                            className="w-full h-full rounded"
                            controls={false}
                            muted
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center rounded">
                            <svg
                              className="w-8 h-8 text-white"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {item.caption?.en ||
                              item.title?.en ||
                              item.fileName}
                          </h3>
                          {item.eventTag && (
                            <span className="inline-block bg-mainColor text-white text-xs px-2 py-1 rounded mt-1">
                              {item.eventTag}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {item.type === "image" ? "📷 Photo" : "🎥 Video"}
                        </span>
                      </div>
                      {item.uploadDate && (
                        <p className="text-sm text-gray-600 mt-2">
                          📅 {new Date(item.uploadDate).toLocaleDateString()}
                        </p>
                      )}
                      {(item.description?.en || item.caption?.te) && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {item.description?.en || item.caption?.te}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Lightbox */}
        {lightboxOpen && selectedMedia && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 z-10"
              onClick={closeLightbox}
            >
              ×
            </button>

            <div
              className="max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {mediaType === "image" ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.caption?.en || selectedMedia.fileName}
                  className="max-w-full max-h-[90vh] object-contain mx-auto"
                />
              ) : (
                <video
                  src={selectedMedia.url}
                  controls
                  autoPlay
                  className="w-full max-h-[80vh] rounded-lg"
                />
              )}

              <div className="mt-4 text-white text-center">
                {selectedMedia.eventTag && (
                  <span className="inline-block bg-mainColor px-3 py-1 rounded mb-2">
                    {selectedMedia.eventTag}
                  </span>
                )}
                <h2 className="text-2xl font-bold mb-2">
                  {selectedMedia.caption?.en ||
                    selectedMedia.title?.en ||
                    selectedMedia.fileName}
                </h2>
                {(selectedMedia.description?.en ||
                  selectedMedia.caption?.te) && (
                  <p className="text-gray-300">
                    {selectedMedia.description?.en || selectedMedia.caption?.te}
                  </p>
                )}
                {selectedMedia.uploadDate && (
                  <p className="text-sm text-gray-400 mt-2">
                    {new Date(selectedMedia.uploadDate).toLocaleDateString()}
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

export default Gallery;
