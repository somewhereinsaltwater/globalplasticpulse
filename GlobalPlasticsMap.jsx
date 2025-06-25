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

        console.log("✅ Airtable Data:", data);

        const records = data.records
          .filter((record) => record.fields.Latitude && record.fields.Longitude)
          .map((record) => ({
            country: record.fields.Country,
            lat: parseFloat(record.fields.Latitude),
            lng: parseFloat(record.fields.Longitude),
            type: record.fields['Type of Law'],
            description: record.fields.Description,
            source: (record.fields.URL || '').trim(),
          }));

        setLocations(records);
      } catch (error) {
        console.error('❌ API route fetch failed:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!map.current && mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-119.4179, 36.7783], // California as default center
        zoom: 3.5,
      });

      map.current.markers = [];
      window.__MAP = map.current;
    }
  }, []);

  useEffect(() => {
    if (!map.current || locations.length === 0) return;

    // Clear existing markers
    map.current.markers.forEach((marker) => marker.remove());
    map.current.markers = [];

    locations.forEach((location, idx) => {
      if (!location.lat || !location.lng) {
        console.warn(`⚠️ Skipped location missing coordinates: ${location.country}`);
        return;
      }

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div style="padding: 10px; max-width: 240px; font-size: 14px;">
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

      console.log(`📍 Marker ${idx + 1} added for ${location.country}`);
    });

    // Optional: Fly to first marker
    if (locations.length > 0) {
      map.current.flyTo({
        center: [locations[0].lng, locations[0].lat],
        zoom: 3.5,
      });
    }
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
