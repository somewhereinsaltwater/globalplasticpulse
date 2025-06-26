
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import plasticData from "./data/plastic_policies.json";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const GlobalPlasticsMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = typeFilter === "All"
    ? plasticData
    : plasticData.filter((item) => item["Type of Law"] === typeFilter);

  useEffect(() => {
    if (map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [0, 20],
      zoom: 2,
    });
  }, []);

  useEffect(() => {
    if (!map.current) return;

    map.current.on("load", () => {
      filtered.forEach((location) => {
        const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(
          '<div style="background-color: #f1ede7; padding: 12px; font-family: sans-serif; border-radius: 8px; max-width: 240px;">' +
            '<h3 style="font-size: 16px; margin: 0 0 8px 0;">' + location["Country"] + "</h3>" +
            '<p style="margin: 0;"><strong>Type:</strong> ' + location["Type of Law"] + "</p>" +
            '<p style="margin: 4px 0 0 0;">' + location["Short description"] + "</p>" +
            '<a href="' + location["URL"] + '" target="_blank" style="display: block; margin-top: 8px; color: #0000EE;">Read more</a>' +
          "</div>"
        );

        new mapboxgl.Marker({ color: "#000000" })
          .setLngLat([location["Longitude"], location["Latitude"]])
          .setPopup(popup)
          .addTo(map.current);
      });
    });
  }, [filtered]);

  return (
    <div>
      <div style={{ margin: "10px" }}>
        <label>Filter by Type of Law: </label>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="All">All</option>
          <option value="Ban">Ban</option>
          <option value="Regulation">Regulation</option>
          <option value="Tax">Tax</option>
          <option value="Fee">Fee</option>
        </select>
      </div>
      <div ref={mapContainer} style={{ width: "100%", height: "90vh" }} />
    </div>
  );
};

export default GlobalPlasticsMap;
