import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./GlobalPlasticsMap.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const GlobalPlasticsMap = ({ locations }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [selectedLaw, setSelectedLaw] = useState("All");

  const lawTypes = ["All", ...new Set(locations.map((loc) => loc["Type of Law"]))];

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v10",
      center: [0, 20],
      zoom: 1.5,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
  }, []);

  useEffect(() => {
    if (!map.current) return;

    const filtered = selectedLaw === "All"
      ? locations
      : locations.filter((loc) => loc["Type of Law"] === selectedLaw);

    document.querySelectorAll(".mapboxgl-popup").forEach((el) => el.remove());

    filtered.forEach((location) => {
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div style="
          background-color: #f1ede7;
          border-radius: 10px;
          padding: 12px;
          max-width: 250px;
          font-family: 'Helvetica Neue', sans-serif;
          font-size: 13px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <strong>${location.Country}</strong><br/>
          <em>${location["Type of Law"]}</em><br/>
          ${location.Policy || ""}<br/>
          <a href="${location.Source}" target="_blank" style="color: #0a66c2;">Read more</a>
        </div>`);

      new mapboxgl.Marker()
        .setLngLat([location.Longitude, location.Latitude])
        .setPopup(popup)
        .addTo(map.current);
    });
  }, [selectedLaw, locations]);

  return (
    <div>
      <div className="filter-container">
        {lawTypes.map((type) => (
          <div
            key={type}
            className={`filter-tab ${selectedLaw === type ? "active" : ""}`}
            onClick={() => setSelectedLaw(type)}
          >
            {type}
          </div>
        ))}
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
};

export default GlobalPlasticsMap;
