
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
          source: record.fields.URL
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

    if (map.current) {
      // Remove existing markers
      const existingMarkers = document.getElementsByClassName('mapboxgl-marker');
      while (existingMarkers.length > 0) {
        existingMarkers[0].remove();
      }

      const filtered = selectedType === 'All'
        ? locations
        : locations.filter(loc => loc.type === selectedType);

      filtered.forEach((location) => {
        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(
          `<div style="background-color:#f1ede7;padding:12px;border-radius:10px;font-family:sans-serif;max-width:260px;">
            <div style="font-weight:bold;font-size:16px;margin-bottom:6px;">${location.country} - ${location.location}</div>
            <div style="font-size:14px;margin-bottom:8px;"><strong>${location.type}</strong><br>${location.description}</div>
            <a href="${location.source}" target="_blank" style="color:#4a90e2;font-weight:bold;">Read more</a>
          </div>`
        );

        new mapboxgl.Marker({ color: 'black' })
          .setLngLat([location.lng, location.lat])
          .setPopup(popup)
          .addTo(map.current);
      });
    }
  }, [locations, selectedType]);

  const uniqueTypes = ['All', ...Array.from(new Set(locations.map(loc => loc.type)))];

  return (
    <>
      <div style={{
        position: 'absolute', top: 10, left: 10, zIndex: 10, backgroundColor: '#000000cc',
        borderRadius: '12px', padding: '6px 10px', display: 'flex', gap: '10px',
        overflowX: 'auto', whiteSpace: 'nowrap', backdropFilter: 'blur(4px)',
        color: '#fff', fontSize: '14px'
      }}>
        {uniqueTypes.map(type => (
          <div key={type}
            onClick={() => setSelectedType(type)}
            style={{
              padding: '6px 12px',
              borderRadius: '10px',
              background: selectedType === type ? '#00ffe0' : '#333',
              color: selectedType === type ? '#000' : '#fff',
              cursor: 'pointer',
              flexShrink: 0
            }}>
            {type}
          </div>
        ))}
      </div>
      <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />
    </>
  );
};

export default GlobalPlasticsMap;
