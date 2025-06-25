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

        console.log("✅ Airtable API response:", data);

        const records = data.records
          .filter(record =>
            record.fields &&
            record.fields.Latitude &&
            record.fields.Longitude
          )
          .map(record => ({
            country: record.fields.Country || "Unknown",
            lat: record.fields.Latitude,
            lng: record.fields.Longitude,
            type: record.fields['Type of Law'] || "No type",
            description: record.fields.Description || "No description provided.",
            source: record.fields.URL || "#"
          }));

        console.log(`📍 Valid locations found: ${records.length}`, records);
        setLocations(records);
      } catch (error) {
        console.error('❌ Failed to fetch Airtable data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!map.current && mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-119.4179, 36.7783], // California
        zoom: 4,
      });
    }

    if (map.current && locations.length) {
      locations.forEach((location) => {
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
        }).setHTML(\`
          <div style="padding: 10px; max-width: 240px; font-size: 14px; border-radius: 8px;">
            <strong>\${location.country}</strong><br />
            \${location.type}<br />
            \${location.description}<br />
            <a href="\${location.source}" target="_blank" rel="noopener noreferrer">Read more</a>
          </div>
        \`);

        new mapboxgl.Marker({ color: 'black' })
          .setLngLat([location.lng, location.lat])
          .setPopup(popup)
          .addTo(map.current);
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