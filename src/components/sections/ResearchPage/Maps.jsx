// src/MapComponent.js
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for marker icon not displaying
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapComponent = () => {
  const locationData = {
    name: "Vadamalapeta",
    coordinates: [13.5283421, 79.5028648879408],
    description: "This is Vadamalapeta, located in Andhra Pradesh, India.",
  };

  return (
    <MapContainer center={locationData.coordinates} zoom={13} style={{ height: "600px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={locationData.coordinates}>
        <Popup>
          <h3>{locationData.name}</h3>
          <p>{locationData.description}</p>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapComponent;