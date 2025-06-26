
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const GlobalPlasticsMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [locations, setLocations] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch("/api/airtable")
      .then((res) => res.json())
      .then((data) => {
        const records = data.records.map((record) => ({
          id: record.id,
          country: record.fields["Country"] || "",
          location: record.fields["Location"] || "",
          type: record.fields["Type of Law"] || "",
          description: record.fields["Short description"] || "",
          latitude: record.fields["Latitude of Location"],
          longitude: record.fields["Longitude of Location"],
          url: record.fields["The URL referencing the source of the information"] || "#",
        }));
        setLocations(records);
      });
  }, []);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [0, 20],
      zoom: 1.5,
    });
  }, []);

  useEffect(() => {
    if (!map.current || !locations.length) return;

    const filtered = filter === "All" ? locations : locations.filter((l) => l.type === filter);

    filtered.forEach((location) => {
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div style="
          background-color: #f1ede7;
          padding: 12px;
          border-radius: 10px;
          max-width: 250px;
          font-family: 'Helvetica Neue', sans-serif;
        ">
          <div style="font-size: 12px; font-weight: bold;">${location.country}</div>
          <div style="font-size: 12px; margin: 4px 0;">${location.location}</div>
          <div style="font-size: 12px;"><strong>${location.type}</strong>: ${location.description}</div>
          <a href="${location.url}" target="_blank" style="font-size: 11px; color: #000; text-decoration: underline;">View Source</a>
        </div>
      `);

      new mapboxgl.Marker({ color: "black" })
        .setLngLat([location.longitude, location.latitude])
        .setPopup(popup)
        .addTo(map.current);
    });
  }, [locations, filter]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: "250px", padding: "10px", background: "#fff", zIndex: 1 }}>
        <h4>Filter by Type of Law</h4>
        <select onChange={(e) => setFilter(e.target.value)} value={filter}>
          <option value="All">All</option>
          <option value="Ban">Ban</option>
          <option value="Tax">Tax</option>
          <option value="Regulation">Regulation</option>
        </select>
      </div>
      <div ref={mapContainer} style={{ flex: 1 }} />
    </div>
  );
};

export default GlobalPlasticsMap;
