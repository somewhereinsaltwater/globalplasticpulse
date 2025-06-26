import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './GlobalPlasticsMap.css';
import 'mapbox-gl/dist/mapbox-gl.css'; // Ensure mapbox styles are included

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const GlobalPlasticsMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [locations, setLocations] = useState([]);
  const [selectedType, setSelectedType] = useState('All');

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
          source: record.fields.URL
        }));
        setLocations(records);
      } catch (error) {
        console.error('Failed to load data:', error);
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

    if (map.current && locations.length) {
      const markers = document.getElementsByClassName('mapboxgl-marker');
      while (markers[0]) {
        markers[0].parentNode.removeChild(markers[0]);
      }

      locations
        .filter(loc => selectedType === 'All' || loc.type === selectedType)
        .forEach((location) => {
          const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(\`
            <div class="popup-box">
              <strong>\${location.country} – \${location.location}</strong><br />
              <em>\${location.type}</em><br />
              <p>\${location.description}</p>
              <a href="\${location.source}" target="_blank" rel="noopener noreferrer">View Source</a>
            </div>
          \`);
          new mapboxgl.Marker({ color: 'black' })
            .setLngLat([location.lng, location.lat])
            .setPopup(popup)
            .addTo(map.current);
        });
    }
  }, [locations, selectedType]);

  const types = ['All', ...Array.from(new Set(locations.map(loc => loc.type)))];

  return (
    <div className="map-wrapper">
      <img src="/global-plastic-watch-logo.svg" alt="Global Plastic Watch Logo" className="logo" />
      <div className="filter-tabs">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={type === selectedType ? 'tab active' : 'tab'}
          >
            {type}
          </button>
        ))}
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
};

export default GlobalPlasticsMap;