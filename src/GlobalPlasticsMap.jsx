import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const GlobalPlasticsMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [locations, setLocations] = useState([]);

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
          source: record.fields.URL,
        }));

        setLocations(records);
      } catch (error) {
        console.error('Failed to load data from API route:', error);
        alert('❌ API route fetch failed – check logs!');
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
      locations.forEach((location) => {
        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
          <div style="
            font-family: 'Arial', sans-serif;
            font-size: 13px;
            line-height: 1.5;
            background: #f9f9f9;
            padding: 12px;
            border-radius: 6px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            max-width: 260px;
          ">
            <div style="font-weight: bold; color: #333;">${location.country} — ${location.type}</div>
            <div style="margin-top: 6px; color: #555;">
              ${location.description}
            </div>
            <div style="margin-top: 8px; font-size: 12px; color: #888;">
              <a href="${location.source}" target="_blank" rel="noopener noreferrer" style="color: #0066cc; text-decoration: none;">
                Source ↗
              </a>
            </div>
          </div>
        `);

        new mapboxgl.Marker({ color: 'black' })
          .setLngLat([location.lng, location.lat])
          .setPopup(popup)
          .addTo(map.current);
      });
    }
  }, [locations]);

  return (
    <>
      <div
        ref={mapContainer}
        style={{
          width: '100%',
          height: '100vh',
        }}
      />
      {locations.length === 0 && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: 'white',
          padding: '8px',
          zIndex: 999,
          fontSize: '14px',
        }}>
          No locations loaded
        </div>
      )}
    </>
  );
};

export default GlobalPlasticsMap;
