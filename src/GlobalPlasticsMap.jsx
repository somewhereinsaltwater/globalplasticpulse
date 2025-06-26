
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './style.css';
import logo from './assets/global-plastic-watch-logo.svg'; // adjust path if needed

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
          lat: record.fields.Latitude,
          lng: record.fields.Longitude,
          type: record.fields['Type of Law'],
          description: record.fields.Description,
          source: record.fields.URL
        }));

        setLocations(records);
      } catch (error) {
        console.error('Failed to load data from API route:', error);
      }
    };

    fetchData();
  }, []);

  const types = ['All', ...Array.from(new Set(locations.map(loc => loc.type)))];

  const filteredLocations = selectedType === 'All'
    ? locations
    : locations.filter(loc => loc.type === selectedType);

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
      // Clear existing markers
      map.current.eachLayer?.((layer) => {
        if (layer.type === 'symbol') map.current.removeLayer(layer.id);
      });

      filteredLocations.forEach((location) => {
        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
          <div style="
            background-color: #f1ede7;
            padding: 12px;
            border-radius: 8px;
            font-size: 13px;
            color: #222;
          ">
            <strong>${location.country}</strong><br />
            <em>${location.type}</em><br />
            ${location.description}<br />
            <a href="${location.source}" target="_blank" style="color:#0077cc">Read more</a>
          </div>
        `);

        new mapboxgl.Marker({ color: 'black' })
          .setLngLat([location.lng, location.lat])
          .setPopup(popup)
          .addTo(map.current);
      });
    }
  }, [filteredLocations]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div
        ref={mapContainer}
        style={{ width: '100%', height: '100vh' }}
      />

      <img
        src={logo}
        alt="Global Plastic Watch Logo"
        style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          maxWidth: '220px',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 10,
          zIndex: 1000,
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          background: 'rgba(255,255,255,0.8)',
          padding: '6px 12px',
          borderRadius: '12px',
        }}
      >
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            style={{
              padding: '6px 10px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              background: selectedType === type ? '#0077cc' : '#eee',
              color: selectedType === type ? '#fff' : '#333',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
            }}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GlobalPlasticsMap;
