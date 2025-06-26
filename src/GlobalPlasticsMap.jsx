
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const GlobalPlasticsMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [locations, setLocations] = useState([]);
  const [filter, setFilter] = useState('All');

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
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    map.current.eachLayer?.((layer) => {
      if (layer.type === 'symbol') map.current.removeLayer(layer);
    });

    const filtered = filter === 'All' ? locations : locations.filter((loc) => loc.type === filter);

    filtered.forEach((location) => {
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div style="
          background-color: #f1ede7;
          border-left: 4px solid #525252;
          padding: 12px;
          max-width: 260px;
          font-size: 14px;
          font-family: sans-serif;
          color: #1e1e1e;
        ">
          <div style="font-weight: bold; font-size: 16px; margin-bottom: 4px;">${location.country}</div>
          <div style="margin-bottom: 6px;"><em>${location.type}</em></div>
          <div style="margin-bottom: 6px;">${location.description}</div>
          <a href="${location.source}" target="_blank" style="color: #0077cc; text-decoration: underline;">Read more</a>
        </div>
      `);

      new mapboxgl.Marker({ color: 'black' })
        .setLngLat([location.lng, location.lat])
        .setPopup(popup)
        .addTo(map.current);
    });
  }, [locations, filter]);

  const uniqueTypes = ['All', ...new Set(locations.map(loc => loc.type))];

  return (
    <>
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 999 }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          {uniqueTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />
    </>
  );
};

export default GlobalPlasticsMap;
