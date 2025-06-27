import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import './GlobalPlasticsMap.css';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const GlobalPlasticsMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [locations, setLocations] = useState([]);
  const [activeTypes, setActiveTypes] = useState([]);
  const activePopupRef = useRef(null);

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
          type: Array.isArray(record.fields['Type of Law'])
            ? record.fields['Type of Law']
            : [record.fields['Type of Law']],
          description: record.fields.Description,
          source: record.fields.URL,
          region: record.fields.Region || '',
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
  center: [-100, 40],  // ← North America
  zoom: 2.5,
});
    }

    if (map.current) {
      const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
      existingMarkers.forEach((marker) => marker.remove());

      locations
        .filter((location) =>
          activeTypes.length === 0 ||
          location.type.some((t) => activeTypes.includes(t))
        )
        .forEach((location) => {
          const popupContent = document.createElement('div');
          popupContent.className = 'popup-content popup-fade';

         popupContent.innerHTML = `
  <div class="popup-inner">
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
      <div class="popup-type">
        ${Array.isArray(location.type)
          ? location.type.join(', ').toUpperCase()
          : location.type || 'LAW TYPE'}
      </div>
      <div class="popup-title">
        ${location.country}
        ${location.region ? ` — ${location.region}` : ''}
        ${location.location ? ` — ${location.location}` : ''}
      </div>
      <div class="popup-description">${location.description}</div>
      <a href="${location.source}" target="_blank" rel="noopener noreferrer" class="popup-link">
        READ MORE
      </a>
    </div>
  </div>
`;
          const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: false,
          });

          popup.setDOMContent(popupContent);

          const marker = new mapboxgl.Marker({ color: 'black' })
  .setLngLat([location.lng, location.lat])
  .setPopup(popup) // attach popup to marker
  .addTo(map.current);
        });
    }
  }, [locations, activeTypes]);

  const allTypes = locations.flatMap((loc) => loc.type);
  const uniqueTypes = Array.from(new Set(allTypes));

  const toggleType = (type) => {
    setActiveTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="map-wrapper">
      <img
        src="/global-plastic-watch-logo.svg"
        alt="Global Plastic Watch Logo"
        className="logo"
      />
      <div className="filter-container">
        {uniqueTypes.map((type) => (
          <button
            key={type}
            className={`filter-tab ${activeTypes.includes(type) ? 'active' : ''}`}
            onClick={() => toggleType(type)}
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
