
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

    if (map.current) {
      map.current.on('load', () => {
        map.current.resize();
      });
    }
  }, []);

  useEffect(() => {
    if (!map.current || !locations.length) return;

    document.querySelectorAll('.mapboxgl-marker').forEach(marker => marker.remove());

    const filtered = filter === 'All' ? locations : locations.filter(loc => loc.type === filter);

    filtered.forEach((location) => {
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
      }).setDOMContent(() => {
        const container = document.createElement('div');
        container.style.margin = '0';
        container.style.padding = '0';

        container.innerHTML = `
          <div style="
            background-color: #f1ede7;
            border: 1px solid #d6ccc2;
            border-radius: 6px;
            font-family: Arial, sans-serif;
            font-size: 13px;
            line-height: 1.5;
            color: #222;
            padding: 10px 12px;
            max-width: 240px;
          ">
            <div style="font-weight: bold; margin-bottom: 6px;">${location.country}</div>
            <div style="color: #5a5a5a; font-style: italic; margin-bottom: 6px;">${location.type}</div>
            <div style="margin-bottom: 8px;">${location.description}</div>
            <a href="${location.source}" target="_blank" style="color: #0074cc; text-decoration: underline;">Read more</a>
          </div>
        `;

        return container;
      });

      new mapboxgl.Marker({ color: 'black' })
        .setLngLat([location.lng, location.lat])
        .setPopup(popup)
        .addTo(map.current);
    });
  }, [locations, filter]);

  return (
    <>
      <div style={{ position: 'absolute', top: 20, width: '100%', textAlign: 'center', zIndex: 1000 }}>
        <img src="/global plastic watch logo.svg" alt="Logo" style={{ height: '50px' }} />
      </div>

      <div style={{ position: 'absolute', top: 80, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 1000, gap: '8px', flexWrap: 'wrap' }}>
        {['All', 'Regulation', 'Ban', 'Tax'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            style={{
              background: filter === type ? '#0ff' : '#222',
              border: '1px solid #ccc',
              padding: '8px 12px',
              color: '#fff',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '12px',
              textTransform: 'uppercase'
            }}
          >
            {type}
          </button>
        ))}
      </div>

      <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />
    </>
  );
};

export default GlobalPlasticsMap;
