import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './GlobalPlasticsMap.css'; // ✅ Importing the external stylesheet

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const GlobalPlasticsMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [selectedType, setSelectedType] = useState('All');

  const types = ['All', 'Ban', 'Regulation', 'Tax'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/airtable');
        const data = await res.json();
        const records = data.records.map((record) => ({
          country: record.fields.Country,
          location: record.fields.Location,
          lat: record.fields.Latitude,
          lng: record.fields.Longitude,
          type: record.fields['Type of Law'],
          description: record.fields.Description,
          source: record.fields.URL,
        }));
        setLocations(records);
        setFilteredLocations(records);
      } catch (err) {
        console.error('Failed to load Airtable data:', err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!map.current && mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [0, 20],
        zoom: 1.5,
      });
    }

    if (map.current) {
      map.current.on('load', () => {
        filteredLocations.forEach((location) => {
          const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(
            `<div class="popup-content">
              <div class="popup-header">${location.country} - ${location.location}</div>
              <div class="popup-body">${location.description}</div>
              <div class="popup-footer"><a href="${location.source}" target="_blank" rel="noopener noreferrer">Source</a></div>
            </div>`
          );

          new mapboxgl.Marker({ color: 'black' })
            .setLngLat([location.lng, location.lat])
            .setPopup(popup)
            .addTo(map.current);
        });
      });
    }
  }, [filteredLocations]);

  useEffect(() => {
    setFilteredLocations(
      selectedType === 'All'
        ? locations
        : locations.filter((loc) => loc.type === selectedType)
    );
  }, [selectedType, locations]);

  return (
    <>
      <div className="logo">🌍 Global Plastic Watch</div>
      <div className="filter-tabs">
        {types.map((type) => (
          <button
            key={type}
            className={`filter-tab ${selectedType === type ? 'active' : ''}`}
            onClick={() => setSelectedType(type)}
          >
            {type}
          </button>
        ))}
      </div>
      <div ref={mapContainer} className="map-container" />
    </>
  );
};

export default GlobalPlasticsMap;