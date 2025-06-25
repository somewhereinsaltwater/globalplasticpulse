import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const mapData = [
  {
    country: 'Kenya',
    lat: -1.2921,
    lng: 36.8219,
    type: 'Plastic Bag Ban',
    description: 'Kenya has enforced one of the world’s strictest plastic bag bans since 2017, with fines up to $40,000 or 4 years of prison.',
    source: 'https://www.bbc.com/news/world-africa-41069882'
  },
  {
    country: 'Ireland',
    lat: 53.3498,
    lng: -6.2603,
    type: 'Plastic Bag Levy',
    description: 'Ireland introduced a €0.15 plastic bag levy in 2002, which reduced usage by 90%.',
    source: 'https://www.reuters.com'
  }
];

const GlobalPlasticsMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [0, 20],
      zoom: 1.5,
    });

    mapData.forEach((location) => {
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
    });
  }, []);

  return <div ref={mapContainer} style={{ width: '100%', height: '100vh' }} />;
};

export default GlobalPlasticsMap;