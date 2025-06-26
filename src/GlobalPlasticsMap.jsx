
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const GlobalPlasticsMap = ({ locations }) => {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [selectedType, setSelectedType] = useState('All');

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [0, 20],
      zoom: 1.5,
    });

    setMapInstance(map);

    return () => map.remove();
  }, []);

  useEffect(() => {
    if (!mapInstance) return;

    mapInstance.eachLayer((layer) => {
      if (layer.id !== 'background') {
        try {
          mapInstance.removeLayer(layer.id);
        } catch {}
      }
    });

    mapInstance.eachSource((source) => {
      try {
        mapInstance.removeSource(source.id);
      } catch {}
    });

    const filteredLocations = selectedType === 'All'
      ? locations
      : locations.filter(loc => loc.typeOfLaw === selectedType);

    filteredLocations.forEach((location) => {
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div style="background-color:#f1ede7; padding:10px;">
          <h3>${location.country}</h3>
          <p><strong>Law:</strong> ${location.typeOfLaw}</p>
          <p>${location.summary}</p>
        </div>
      `);

      new mapboxgl.Marker({ color: '#000' })
        .setLngLat([location.lng, location.lat])
        .setPopup(popup)
        .addTo(mapInstance);
    });
  }, [mapInstance, locations, selectedType]);

  return (
    <div>
      <div className="filter-wrapper">
        {['All', 'Ban', 'Tax', 'Incentive'].map((type, index) => (
          <button
            key={type}
            className={`filter-button ${selectedType === type ? 'active' : ''}`}
            onClick={() => setSelectedType(type)}
          >
            {index === 0 ? 'All' : `0${index} ${type}`}
          </button>
        ))}
      </div>
      <div ref={mapRef} className="map-container" style={{ height: '600px' }} />
    </div>
  );
};

export default GlobalPlasticsMap;
