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

    return () => map.current?.remove();
  }, []);

  useEffect(() => {
    if (map.current && locations.length) {
      // Clear existing markers
      const markerElements = document.querySelectorAll('.mapboxgl-marker');
      markerElements.forEach((el) => el.remove());

      const filtered = selectedType === 'All'
        ? locations
        : locations.filter((l) => l.type === selectedType);

      filtered.forEach((location) => {
        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
          <div style="
            font-family: sans-serif;
            background-color: #f1ede7;
            padding: 16px;
            max-width: 260px;
            font-size: 13px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            line-height: 1.4;
          ">
            <div style="font-weight: bold; font-size: 14px;">${location.country} – ${location.location}</div>
            <div style="margin: 6px 0;"><strong>Type:</strong> ${location.type}</div>
            <div>${location.description}</div>
            <div style="margin-top: 8px;"><a href="${location.source}" target="_blank" rel="noopener noreferrer">🔗 Source</a></div>
          </div>
        `);

        new mapboxgl.Marker({ color: 'black' })
          .setLngLat([location.lng, location.lat])
          .setPopup(popup)
          .addTo(map.current);
      });
    }
  }, [locations, selectedType]);

  const lawTypes = ['All', ...new Set(locations.map((loc) => loc.type))];

  return (
    <>
      <div style={{ position: 'absolute', zIndex: 999, top: 10, left: 10 }}>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          style={{
            padding: '6px 10px',
            fontSize: '14px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: 'white',
          }}
        >
          {lawTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div
        ref={mapContainer}
        style={{ width: '100%', height: '100vh' }}
      />
    </>
  );
};

export default GlobalPlasticsMap;