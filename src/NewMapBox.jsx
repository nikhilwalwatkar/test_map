import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoidmJwMTE3IiwiYSI6ImNtZWlka2owdDAxMnkya3NoZnRiZzMycGYifQ.tHzhAyO0ZCOX-3m7mO6ySA";

const NewMapBox = () => {
  const mapContainerRef = useRef(null);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    fetch("/cities.json")
      .then((res) => res.json())
      .then((data) => {
        setCities(data);
        console.log(data, "data");
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [75.3433, 19.7515],
      zoom: 6,
    });
    map.addControl(new mapboxgl.NavigationControl());

    // Test marker
    new mapboxgl.Marker()
      .setLngLat([75.3433, 19.7515])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setText("Maharashtra"))
      .addTo(map);

    return () => map.remove();
  }, []);

  //   useEffect(() => {
  //     if (cities?.length === 0) return;
  //     const map = new mapboxgl.Map({
  //       container: mapContainerRef.current,
  //       style: "mapbox://styles/mapbox/streets-v11",
  //       center: [75.3433, 19.7515], // Maharashtra center
  //       //   center: [79.0882, 21.1458],
  //       zoom: 6,
  //     });
  //     map.addControl(new mapboxgl.NavigationControl());

  //     cities.forEach((city) => {
  //       const el = document.createElement("div");
  //       el.className = "custom-marker";
  //       el.style.width = "30px";
  //       el.style.height = "30px";
  //       el.style.backgroundColor = city.color; // Coral orange
  //       el.style.borderRadius = "50%";
  //       el.style.border = "2px solid white";
  //       el.style.boxShadow = "0 0 6px rgba(0,0,0,0.3)";
  //       el.style.cursor = "pointer";

  //       new mapboxgl.Marker(el)
  //         .setLngLat(city.coords)
  //         .setPopup(
  //           new mapboxgl.Popup({ offset: 25 }).setHTML(`
  //           <div style="padding:5px 10px;font-family:sans-serif;">
  //             <h3 style="margin:0;color:#2c722c;">${city.name}</h3>
  //             <p style="margin:0;font-size:14px;">${city.desc}</p>
  //           </div>
  //         `)
  //         )
  //         .addTo(map);
  //     });

  //     return () => map.remove();
  //   }, [cities]);
  return (
    <div className="w-full h-screen">
      <div
        ref={mapContainerRef}
        className="w-full h-full  rounded-xl shadow-lg"
      ></div>
    </div>
  );
};

export default NewMapBox;
