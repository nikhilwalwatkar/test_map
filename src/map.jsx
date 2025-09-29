import mapboxgl from 'mapbox-gl';
import { useRef, useEffect } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';

function PostalCodeMap_test() {
  const mapContainer = useRef(null);

  useEffect(() => {
    mapboxgl.accessToken = "pk.eyJ1IjoidmJwMTE3IiwiYSI6ImNtZWlka2owdDAxMnkya3NoZnRiZzMycGYifQ.tHzhAyO0ZCOX-3m7mO6ySA"
    
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.006, 40.7128],
      zoom: 10
    });

    return () => map.remove();
  }, []);

  return <div ref={mapContainer} style={{ width: '100%', height: '400px' }} />;
}

export default PostalCodeMap_test;
