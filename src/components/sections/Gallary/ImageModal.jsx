import React, { useEffect } from 'react';

const ImageModal = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen) return null;

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75"
      onClick={handleBackgroundClick}
      style={{ zIndex: 5 }}
    >
      <div className="relative">
        <img
          src={imageUrl}
          alt="Large view"
          className="max-w-full"
          style={{ maxHeight: `calc(100vh - 24px)` }} 
        />
        <button
  onClick={onClose}
  className="absolute h-6 w-6 top-3 right-6 bg-red-600 text-white text-lg rounded-full flex items-center justify-center hover:bg-red-700 transition duration-200"
  aria-label="Close"
>
  &times;
</button>
      </div>
    </div>
  );
};

export default ImageModal;