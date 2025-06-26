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
        center: [0, 20],
        zoom: 1.5,
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
                <div style="font-size: 11px; font-weight: bold; margin-bottom: 4px; color: #ff5800;">
                  ${Array.isArray(location.type)
                    ? location.type.join(', ').toUpperCase()
                    : location.type || 'LAW TYPE'}
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
            </div>
          `;

          const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: false,
          });

          popup.setDOMContent(popupContent);

          const marker = new mapboxgl.Marker({ color: 'black' })
            .setLngLat([location.lng, location.lat])
            .addTo(map.current);

          marker.getElement().addEventListener('click', () => {
            if (activePopupRef.current === popup) {
              popup.remove();
              activePopupRef.current = null;
            } else {
              if (activePopupRef.current) activePopupRef.current.remove();
              popup.setLngLat([location.lng, location.lat]).addTo(map.current);
              activePopupRef.current = popup;
            }
          });
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
