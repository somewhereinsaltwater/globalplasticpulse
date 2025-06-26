import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
          source: record.fields.URL,
        }));

        setLocations(records);
      } catch (error) {
        console.error('Failed to load data from API route:', error);
      }
    };

    fetchData();
  }, []);

  const types = ['All', ...Array.from(new Set(locations.map(loc => loc.type)))];

  const filtered = selectedType === 'All'
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
      map.current.on('load', () => {
        filtered.forEach((location) => {
          const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(
            `<div style="
              background-color: #f1ede7;
              padding: 12px;
              border-radius: 8px;
              font-family: sans-serif;
              max-width: 260px;
            ">
              <div style="font-weight: bold; margin-bottom: 6px;">${location.country} — ${location.location}</div>
              <div style="margin-bottom: 4px;"><strong>${location.type}</strong></div>
              <div style="margin-bottom: 8px;">${location.description}</div>
              <a href="${location.source}" target="_blank" style="color: #007aff; text-decoration: underline;">Read more</a>
            </div>`
          );

          new mapboxgl.Marker({ color: 'black' })
            .setLngLat([location.lng, location.lat])
            .setPopup(popup)
            .addTo(map.current);
        });
      });
    }
  }, [filtered]);

  return (
    <>
      {/* Logo */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1001,
      }}>
        <img src="/logo.svg" alt="Global Plastic Watch" style={{ height: '48px' }} />
      </div>

      {/* Filter Tabs */}
      <div style={{
        position: 'absolute',
        top: '70px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1001,
        display: 'flex',
        gap: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '20px',
        padding: '4px 8px',
        overflowX: 'auto',
      }}>
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: 'none',
              backgroundColor: selectedType === type ? '#007aff' : 'transparent',
              color: selectedType === type ? '#fff' : '#333',
              fontWeight: 'bold',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Map Container */}
      <div
        ref={mapContainer}
        style={{
          width: '100%',
          height: '100vh',
          position: 'relative',
          zIndex: 0,
        }}
      />
    </>
  );
};

export default GlobalPlasticsMap;
