
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = "YOUR_MAPBOX_ACCESS_TOKEN";

const GlobalPlasticsMap = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [locations, setLocations] = useState([]);
  const [filterType, setFilterType] = useState("All");

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch("/api/airtable");
        const data = await res.json();
        setLocations(data.records.map(record => ({
          id: record.id,
          country: record.fields.Country,
          location: record.fields.Location,
          type: record.fields.Type,
          description: record.fields.Description,
          latitude: record.fields.Latitude,
          longitude: record.fields.Longitude,
          source: record.fields.Source,
        })));
      } catch (err) {
        console.error("Error fetching locations:", err);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [0, 20],
        zoom: 2,
      });
    }

    const map = mapRef.current;

    if (!map) return;

    map.on("load", () => {
      renderMarkers();
    });

    return () => {
      map.off("load", renderMarkers);
    };
  }, [locations, filterType]);

  const renderMarkers = () => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing markers
    const markers = document.querySelectorAll(".mapboxgl-marker");
    markers.forEach(marker => marker.remove());

    const filtered = filterType === "All" ? locations : locations.filter(loc => loc.type === filterType);

    filtered.forEach((location) => {
      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div style="
          background-color: #f1ede7;
          padding: 16px;
          max-width: 260px;
          font-size: 13px;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          line-height: 1.4;
        ">
          <div style="font-weight: bold; font-size: 14px;">${location.country} – ${location.location}</div>
          <div style="margin: 6px 0;"><strong>Type:</strong> ${location.type}</div>
          <div>${location.description}</div>
          <div style="margin-top: 8px;"><a href="${location.source}" target="_blank" rel="noopener noreferrer">🔗 Source</a></div>
        </div>
      `);

      new mapboxgl.Marker({ color: "black" })
        .setLngLat([location.longitude, location.latitude])
        .setPopup(popup)
        .addTo(map);
    });
  };

  return (
    <div>
      <div style={{ margin: "10px" }}>
        <label htmlFor="typeFilter">Filter by Type of Law: </label>
        <select id="typeFilter" onChange={(e) => setFilterType(e.target.value)}>
          <option value="All">All</option>
          <option value="Regulation">Regulation</option>
          <option value="Ban">Ban</option>
          <option value="Tax">Tax</option>
        </select>
      </div>
      <div ref={mapContainerRef} style={{ width: "100%", height: "90vh" }} />
    </div>
  );
};

export default GlobalPlasticsMap;
