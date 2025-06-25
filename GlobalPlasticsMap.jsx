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
    console.log(`✅ Loaded ${locations.length} locations`);
  }, [locations]);

  useEffect(() => {
    if (!map.current && mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-122.4194, 37.7749], // San Francisco (test location)
        zoom: 3,
      });

      map.current.on('load', () => {
        map.current.resize();

        // 🚨 Test marker to confirm frontend is working
        new mapboxgl.Marker({ color: 'red' })
          .setLngLat([-122.4194, 37.7749])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setText('Test Marker - San Francisco')
          )
          .addTo(map.current);
      });
    }

    if (map.current && locations.length) {
      locations.forEach((location) => {
        if (location.lat && location.lng) {
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

          new mapboxgl.Marker({ color: 'black' })
            .setLngLat([location.lng, location.lat])
            .setPopup(popup)
            .addTo(map.current);
        }
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
          backgroundColor: 'blue', // 💡 temporary blue background
        }}
      />
      {locations.length === 0 && (
        <div style={{ position: 'absolute', top: 10, left: 10, background: 'white', padding: '8px', zIndex: 999 }}>
          No locations loaded
        </div>
      )}
    </>
  );
};

export default GlobalPlasticsMap;
