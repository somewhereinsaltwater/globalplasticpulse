import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './GlobalPlasticsMap.css';
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
          type: record.fields['Type of Law'] || [],
          description: record.fields.Description,
          source: record.fields.URL
        }));
        setLocations(records);
      } catch (error) {
        console.error('Failed to load data:', error);
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
    // No need to remove layers like Leaflet – just add markers
    locations
      .filter(loc => selectedType === 'All' || loc.type.includes(selectedType))
      .forEach((location) => {
            const popup = new mapboxgl.Popup({
      offset: 25,
      closeButton: false,
    }).setHTML(`
      <div style="
        background-color: #f1ede7;
        border: 2px solid black;
        padding: 16px;
        max-width: 280px;
        font-family: 'Helvetica Neue', sans-serif;
        color: #000;
        font-size: 14px;
        border-radius: 8px;
        box-shadow: 3px 3px 0 #000;
      ">
        <div style="font-size: 11px; font-weight: bold; margin-bottom: 4px; color: #ff5800;">
          ${Array.isArray(location.type) ? location.type.join(', ').toUpperCase() : (location.type || 'LAW TYPE')}
        </div>
        <div style="font-size: 16px; font-weight: 700; margin-bottom: 6px;">
          ${location.country}${location.region ? ` — ${location.region}` : ''}
        </div>
        <div style="margin-bottom: 10px; line-height: 1.4;">${location.description}</div>
        <a href="${location.source}" target="_blank" rel="noopener noreferrer" style="
          display: inline-block;
          margin-top: 8px;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: bold;
          background-color: black;
          color: white;
          text-decoration: none;
          border-radius: 4px;
        ">READ MORE</a>
      </div>
    `);

        new mapboxgl.Marker({ color: 'black' })
          .setLngLat([location.lng, location.lat])
          .setPopup(popup)
          .addTo(map.current);
      });
  }
}, [locations, selectedType]);

 const allTypes = locations.flatMap(loc => loc.type); // flatten all arrays into one list
const types = ['All', ...Array.from(new Set(allTypes))];

  return (
    <div className="map-wrapper">
      <img src="/global-plastic-watch-logo.svg" alt="Global Plastic Watch Logo" className="logo" />
      <div className="filter-tabs">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={type === selectedType ? 'tab active' : 'tab'}
          >
            {type}
          </button>
        ))}
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
};

export default GlobalPlasticsMap;