import React, { useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import "./ResearchMap.css";

const mapContainerStyle = {
  width: "100%",
  height: "600px",
  borderRadius: "8px",
};

const blackYellowMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#000000" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#000000" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#FFD700" }] }, // Yellow text
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#FFD700" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#FFD700" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#1a1a1a" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#333333" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#FFD700" }], // Yellow road lines
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#000000" }],
  },
];

const ResearchMap = ({ locations, title }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyCztqWSmvXtm0ok4erFnEBdxZmUCn1iMq4",
  });

  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
  };

  const handleInfoWindowClose = () => {
    setSelectedLocation(null);
  };

  const navigateToGoogleMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  const customMarkerIcon = {
    url: "/marker-gold.png",
    scaledSize: { width: 38, height: 38 },
    origin: { x: 0, y: 0 },
    anchor: { x: 19, y: 38 },
  };

  return (
    <div className="research-map-container">
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={{ lat: 13.5283421, lng: 79.5028648879408 }} 
          zoom={12}
          options={{
            styles: blackYellowMapStyles,
            disableDefaultUI: true,
            zoomControl: true,
          }}
        >
          {locations &&
            locations.map((location, index) => (
              <Marker
                key={index}
                position={{ lat: location.lat, lng: location.lng }}
                icon={customMarkerIcon}
                onClick={() => handleMarkerClick(location)}
              />
            ))}

          {selectedLocation && (
            <InfoWindow
              position={{
                lat: selectedLocation.lat,
                lng: selectedLocation.lng,
              }}
              onCloseClick={handleInfoWindowClose}
            >
              <div className="info-window">
                <h3>{selectedLocation.name}</h3>
                <p>{selectedLocation.description}</p>
                <button
                  onClick={() =>
                    navigateToGoogleMaps(
                      selectedLocation.lat,
                      selectedLocation.lng
                    )
                  }
                  className="map-button"
                >
                  Open in Google Maps
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      ) : (
        <div>Loading Map...</div>
      )}
    </div>
  );
};

export default ResearchMap;