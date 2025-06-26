
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import locations from "../data/locations.json";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const GlobalPlasticsMap = () => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [selectedLaw, setSelectedLaw] = useState("All");

  const lawTypes = ["All", ...new Set(locations.map((loc) => loc["Type of Law"]))];

  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v10",
      center: [0, 20],
      zoom: 1.4,
    });

    setMap(mapInstance);

    return () => mapInstance.remove();
  }, []);

  useEffect(() => {
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer.id.startsWith("marker-")) {
        try {
          map.removeLayer(layer.id);
        } catch {}
      }
    });

    document.querySelectorAll(".mapboxgl-popup").forEach((popup) => popup.remove());

    const filtered = selectedLaw === "All"
      ? locations
      : locations.filter((loc) => loc["Type of Law"] === selectedLaw);

    filtered.forEach((location, index) => {
      const el = document.createElement("div");
      el.className = "marker";
      el.style.width = "12px";
      el.style.height = "12px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "#c3ff00";
      el.style.border = "2px solid black";

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(
        `<div style="background-color:#f1ede7;padding:10px;border-radius:4px;font-size:14px;">
          <strong>${location.Country}${location.Location ? " – " + location.Location : ""}</strong><br/>
          <em>${location["Type of Law"]}</em><br/>
          ${location["Short description"]}<br/>
          <a href="${location.URL}" target="_blank" style="color:#0077cc;text-decoration:underline;">Read more</a>
        </div>`
      );

      new mapboxgl.Marker(el)
        .setLngLat([location.Longitude, location.Latitude])
        .setPopup(popup)
        .addTo(map);
    });
  }, [map, selectedLaw]);

  return (
    <div>
      <div className="filter-container">
        {lawTypes.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedLaw(type)}
            className={`filter-tab ${selectedLaw === type ? "active" : ""}`}
          >
            {type}
          </button>
        ))}
      </div>
      <div ref={mapContainerRef} className="map-container" />
      <style jsx>{`
        .map-container {
          width: 100%;
          height: 90vh;
        }
        .filter-container {
          display: flex;
          overflow-x: auto;
          margin: 10px 0;
          background: black;
          padding: 8px;
          border-bottom: 3px solid #c3ff00;
        }
        .filter-tab {
          background: none;
          border: none;
          color: white;
          font-size: 16px;
          padding: 10px 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .filter-tab.active {
          background: #c3ff00;
          color: black;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
};

export default GlobalPlasticsMap;
