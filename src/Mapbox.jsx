import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken =
  'pk.eyJ1IjoidmJwMTE3IiwiYSI6ImNtZWlka2owdDAxMnkya3NoZnRiZzMycGYifQ.tHzhAyO0ZCOX-3m7mO6ySA';

const Mapbox = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(
    new mapboxgl.Popup({ closeButton: false, closeOnClick: false })
  );
  const [cities, setCities] = useState([]);

  useEffect(() => {
    fetch('/cities.json')
      .then((res) => res.json())
      .then((data) => {
        setCities(data);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (cities?.length === 0) return;
    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-98.5795, 39.8283],
        zoom: 3,
      });

      mapRef.current.addControl(new mapboxgl.NavigationControl());

      // Add error handling
      mapRef.current.on('error', (e) => {
        console.error('Mapbox error:', e);
      });

      mapRef.current.on('load', () => {
        console.log('Map loaded successfully');

        // Add your custom vector tileset
        mapRef.current.addSource('new_counties', {
          type: 'vector',
          url: 'mapbox://vbp117.0ya6omas',
        });

        // Listen for source data events to debug
        mapRef.current.on('sourcedata', (e) => {
          if (e.sourceId === 'new_counties') {
            console.log('Source data event:', e);
            if (e.isSourceLoaded) {
              console.log('✅ Source loaded successfully');

              // Get source and inspect its layers
              const source = mapRef.current.getSource('new_counties');
              console.log('Source object:', source);

              // Try to get vector tile source info
              if (source && source._options) {
                console.log('Source options:', source._options);
              }
            }
          }
        });

        // Wait a bit for source to load, then add layers
        setTimeout(() => {
          try {
            console.log('Attempting to add layers...');

            // Try different possible source-layer names
            const possibleLayerNames = [
              'new_counties',
              'counties',
              'county',
              'default',
              'layer0',
              'boundaries',
            ];

            // Try the first one (you can modify this based on console output)
            const sourceLayerName = possibleLayerNames[0]; // Start with 'new_counties'

            // Fill layer
            mapRef.current.addLayer({
              id: 'zip-boundaries',
              type: 'fill',
              source: 'new_counties',
              'source-layer': sourceLayerName,
              paint: {
                'fill-color': '#088',
                'fill-opacity': 0.2,
              },
            });

            // Outline layer
            mapRef.current.addLayer({
              id: 'zip-boundaries-outline',
              type: 'line',
              source: 'new_counties',
              'source-layer': sourceLayerName,
              paint: {
                'line-color': '#000',
                'line-width': 1,
              },
            });

            console.log('✅ Layers added successfully');

            // Test if layers have features
            mapRef.current.on('data', (e) => {
              if (e.sourceId === 'new_counties' && e.isSourceLoaded) {
                // Query features to see if data exists
                const features = mapRef.current.querySourceFeatures(
                  'new_counties',
                  {
                    sourceLayer: sourceLayerName,
                  }
                );
                console.log(
                  `Features found in ${sourceLayerName}:`,
                  features.length
                );
                if (features.length > 0) {
                  console.log('Sample feature:', features[0]);
                }
              }
            });

            // Hover popup
            mapRef.current.on('mousemove', 'zip-boundaries', (e) => {
              if (e.features.length > 0) {
                const feature = e.features[0];
                console.log('Hovered feature:', feature.properties);
                const name =
                  feature.properties.name ||
                  feature.properties.NAME ||
                  feature.properties.county ||
                  feature.properties.COUNTY ||
                  'Unknown';

                popupRef.current
                  .setLngLat(e.lngLat)
                  .setHTML(
                    `<div style="font-family:sans-serif;font-size:14px;">
                      <strong>${name}</strong>
                    </div>`
                  )
                  .addTo(mapRef.current);
              }
            });

            mapRef.current.on('mouseleave', 'zip-boundaries', () => {
              popupRef.current.remove();
            });
          } catch (error) {
            console.error('Error adding layers:', error);
          }
        }, 2000);
      });
    }

    return () => {
      if (mapRef.current) mapRef.current.remove();
    };
  }, [mapContainerRef, cities]);

  return (
    <div className="w-full h-screen">
      <div
        ref={mapContainerRef}
        className="w-full h-full rounded-xl shadow-lg"
      ></div>
    </div>
  );
};

export default Mapbox;
