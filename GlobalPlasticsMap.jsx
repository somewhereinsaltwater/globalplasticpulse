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

        console.log("Fetched Airtable data from API route:", data);

        const records = data.records.map((record) => ({
          country: record.fields.Country,
          lat: record.fields.Latitude,
          lng: record.fields.Longitude,
          type: record.fields['Type of Law'],
          description: record.fields.Description,
          source: record.fields.URL?.trim(), // Trim just in case
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

      // Allow access in dev tools
      window.__MAP = map.current;
    }
  }, []);

  useEffect(() => {
    if (!map.current || !locations.length) return;

    // Remove existing markers if re-rendering
    if (map.current.markers) {
      map.current.markers.forEach((marker) => marker.remove());
    }
    map.current.markers = [];

    locations.forEach((location) => {
      if (!location.lat || !location.lng) return;

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
      }).setHTML(`
        <div style="padding: 10px; max-width: 240px; font-size: 14px; border-radius: 8px;">
          <strong>${location.country}</strong><br />
          ${location.type}<br />
          ${location.description}<br />
          <a href="${location.source}" target="_blank" rel="noopener noreferrer">Read more</a>
        </div>
      `);

      const marker = new mapboxgl.Marker({ color: 'black' })
        .setLngLat([location.lng, location.lat])
        .setPopup(popup)
        .addTo(map.current);

      map.current.markers.push(marker);
    });
  }, [locations]);

  return (
    <>
      <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />
      {locations.length === 0 && (
        <div style={{ position: 'absolute', top: 10, left: 10, background: 'white', padding: '8px', zIndex: 999 }}>
          No locations loaded
        </div>
      )}
    </>
  );
};

export default GlobalPlasticsMap;
