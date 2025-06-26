
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./GlobalPlasticsMap.css"; // Assuming you use a CSS file for styles

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const GlobalPlasticsMap = ({ data }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [selectedType, setSelectedType] = useState("All");

  const types = ["All", ...new Set(data.map((item) => item["Type of Law"]))];

  useEffect(() => {
    if (map.current) return; // initialize map only once

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

    document.querySelectorAll(".mapboxgl-popup").forEach((popup) => popup.remove());

    const filtered = selectedType === "All"
      ? data
      : data.filter((item) => item["Type of Law"] === selectedType);

    filtered.forEach((location) => {
      const popupContent = document.createElement("div");
      popupContent.innerHTML = `
        <div style="background-color: #f1ede7; padding: 10px; border-radius: 5px;">
          <strong>${location.Country}</strong><br />
          ${location["Short description"]}
        </div>
      `;
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setDOMContent(popupContent);

      new mapboxgl.Marker({ color: "#333" })
        .setLngLat([parseFloat(location.Longitude), parseFloat(location.Latitude)])
        .setPopup(popup)
        .addTo(map.current);
    });
  }, [selectedType, data]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <img
        src="/global-plastic-watch-logo.svg"
        alt="Logo"
        style={{
          position: "absolute",
          top: 10,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          height: "50px",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 70,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          display: "flex",
          gap: "12px",
          background: "rgba(0,0,0,0.6)",
          borderRadius: "30px",
          padding: "10px 20px",
          overflowX: "auto",
        }}
      >
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            style={{
              background: selectedType === type ? "#ccff00" : "transparent",
              color: selectedType === type ? "#000" : "#fff",
              border: "none",
              borderRadius: "20px",
              padding: "8px 16px",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {type}
          </button>
        ))}
      </div>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default GlobalPlasticsMap;
