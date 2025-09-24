import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoidmJwMTE3IiwiYSI6ImNtZWlka2owdDAxMnkya3NoZnRiZzMycGYifQ.tHzhAyO0ZCOX-3m7mO6ySA";

const TestMap = () => {
  const mapContainer = useRef(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [75.3433, 19.7515],
      zoom: 6,
    });

    map.addControl(new mapboxgl.NavigationControl());

    new mapboxgl.Marker().setLngLat([75.3433, 19.7515]).addTo(map);

    return () => map.remove();
  }, []);

  return <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />;
};

export default TestMap;
