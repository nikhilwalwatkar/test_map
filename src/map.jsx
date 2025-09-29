import mapboxgl from "mapbox-gl";
import { useRef, useEffect, useState, useMemo } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import axios from "axios";

// Add this function before your PostalCodeMap component
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

const createPinIcon = (color = "#000000") => {
  const svgString = `
    <svg width="24" height="36" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
      <!-- Pin body -->
      <path d="M12 2C8 2 5 5 5 9c0 2.5 1.2 4.7 3 6L12 34l4-19c1.8-1.3 3-3.5 3-6 0-4-3-7-7-7z" 
            fill="${color}" />
      <!-- Pin head highlight -->
      <circle cx="12" cy="9" r="3" fill="#ffffff"/>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
};

function PostalCodeMap() {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const hoverPopupRef = useRef(); // Reference for hover popup
  const [centerCoords, setCenterCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedZipData, setSelectedZipData] = useState(null); // New state for popup data
  const [initialLeadsData, setinitialLeadsData] = useState({});
  const [loading_map_data, setloading_map_data] = useState(false);
  const [dataset, setdataset] = useState();
  let account_id = "2849d50f-014b-417c-a547-7b86cd1b0ed8";
  const img = new Image();

  let token =
    "eyJraWQiOiJvbHZQMVo0b2prUHJqZklVK2h3WkNzdFh2dStcL2c1cisySUpCRFo2ZksyND0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2MWIzY2Q0YS0zMGMxLTcwNWMtN2UyNC0yMDU4NmNhYjk0N2YiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGgtMS5hbWF6b25hd3MuY29tXC9hcC1zb3V0aC0xXzY4SFdzb0gyRSIsImNsaWVudF9pZCI6IjRpMW9xMDZzbDZ2bnBzZ2FhbTcwZnE4aHBuIiwib3JpZ2luX2p0aSI6ImNlOGUzY2ZkLTZkMzctNDYzYS1iMjRiLTM1OWVjYzJhOTFkOCIsImV2ZW50X2lkIjoiYjJhOWIzNDItMmZhNC00NzVlLWEwYTAtMThiMTAxY2VlNzc4IiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTc1OTEyNTM5NiwiZXhwIjoxNzU5MjExNzk2LCJpYXQiOjE3NTkxMjUzOTYsImp0aSI6IjRkNDY3YzVkLWExOGQtNGNkMy04YmNlLWYxYmNjYTNkMTFmNyIsInVzZXJuYW1lIjoiNjFiM2NkNGEtMzBjMS03MDVjLTdlMjQtMjA1ODZjYWI5NDdmIn0.ovzBhhkEO5NL8qONKc9NtgKgiLiN-Jv4BgsRIFhyqeAzUNdlTWJldXRo_RQEwQfffr_J_fCUBS0kwxh5HBDqp6WQH8Vf93q2L_HjdpVbkws8884FAyGsqK9YMqwsOA-aKvoeAAhGMsy4tOyFKp4OkM13TyognWDGJlvwROG3o2ghct9KLo3kn2FHQIbuW1WfMgk6HU2umgCECdd7OZlw74uJE1bxFRs-lsFcFE2vu0JpmHp-C5k6Ns31HDZ87y1OYUpklLqA5yGpLTbUVzwcpgV65qan_THERHCSY5zR70I0DWJCDo6ZPZJ1ZSeO0eene49Vw4YkCbiC-fY6R9YCdA";

  const get_geojson = async (token) => {
    return await axios.get(
      `https://y6wshclgv1.execute-api.ap-south-1.amazonaws.com/dev/getgeofile`,
      {
        headers: {
          Accept: "*",
          "Content-Type": "application/json",
          Authorization: token,
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  };

  const get_account_data_for_map = async (token, account_id) => {
    return await axios.get(
      `https://y6wshclgv1.execute-api.ap-south-1.amazonaws.com/dev/getaccountzipcodemapping?account_id=${account_id}`,
      {
        headers: {
          Accept: "*",
          "Content-Type": "application/json",
          Authorization: token,
          // "Access-Control-Allow-Origin": "*",
        },
      }
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      setloading_map_data(true);
      axios
        .get(
          `https://y6wshclgv1.execute-api.ap-south-1.amazonaws.com/dev/getgeofile?account_id=${account_id}`,
          {
            headers: {
              Authorization: token,
              Accept: "*",
              "Content-Type": "application/json",
            },
          }
        )
        ?.then((res) => {
          let url = res?.data?.url;
          console.log("url", url);
          axios
            .get(url)
            ?.then((res) => {
              let data = res?.data;
              console.log("data", data);
              setdataset(data);
            })
            ?.catch((err) =>
              console.log("error getting data from prefetch url ", err)
            );
        })
        ?.catch((err) => console.log("error - 1 calling prefetch url", err));
      // try {
      //   let res = await fetch("/counties.geojson");
      //   let mydata = await res.json();
      //   setdataset(mydata);
      // } catch (error) {
      //   console.error("Error fetching counties data:", error);
      //   setError("Failed to load counties data");
      // }
    };
    fetchData();
  }, [account_id]);

  useEffect(() => {
    setLoading(true);
    get_account_data_for_map(token, account_id)
      ?.then((res) => {
        if (res?.status == 200) {
          console.log(res?.data);
          setinitialLeadsData(res?.data);
          const coords = {
            lat: parseFloat(res?.data?.center?.latitude),
            lng: parseFloat(res?.data?.center?.longitude),
          };
          setCenterCoords(coords);
        } else {
          setinitialLeadsData({});
          throw "error";
        }
      })
      ?.catch((err) => console.log(err))
      ?.finally(() => setLoading(false));
  }, [account_id]);
  // Fetch coordinates for center zipcode
  // useEffect(() => {
  //   console.log("initialLeadsData", initialLeadsData);
  //   const fetchCenterCoords = async () => {
  //     console.log("initialLeadsData", initialLeadsData);
  //     try {
  //       setLoading(true);
  //       const response = await fetch(
  //         `https://api.zippopotam.us/${
  //           account_id == "a17d8ec1-4781-4776-9d5b-6d76d8e71f11" ? "PR" : "us"
  //         }/${initialLeadsData?.center?.zipcode}`
  //       );
  //       console.log("response", response);

  //       if (!response.ok) {
  //         throw new Error(
  //           `Failed to fetch coordinates for zipcode ${initialLeadsData?.center?.zipcode}`
  //         );
  //       } else if (response.ok) {
  //         const data = await response.json();
  //         const coords = {
  //           lat: parseFloat(data.places[0].latitude),
  //           lng: parseFloat(data.places[0].longitude),
  //         };
  //         setCenterCoords(coords);
  //       }
  //     } catch (err) {
  //       setError("error ");
  //       console.error("Error fetching coordinates:", err);
  //       // Fallback to a default center if API fails
  //       setCenterCoords(false);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   if (
  //     initialLeadsData != undefined &&
  //     Object.keys(initialLeadsData)?.length == 2
  //   ) {
  //     fetchCenterCoords();
  //   }
  // }, [initialLeadsData]);

  const leadCounts = useMemo(() => {
    if (Object.keys(initialLeadsData).length == 2) {
      return Object.fromEntries(
        Object.entries(initialLeadsData.Leads_data).map(([zip, d]) => [
          zip,
          d.total_leads,
        ])
      );
    }
  }, [initialLeadsData]);

  let hoveredZipId = null;

  // Initialize map after getting center coordinates
  useEffect(() => {
    if (!centerCoords || mapRef.current) return;

    mapboxgl.accessToken =
      "pk.eyJ1IjoidmJwMTE3IiwiYSI6ImNtZWlka2owdDAxMnkya3NoZnRiZzMycGYifQ.tHzhAyO0ZCOX-3m7mO6ySA";

    // Calculate max bounds (100 miles from center)
    const maxBoundsDistance = 100 / 69; // Rough conversion: 1 degree ≈ 69 miles
    const maxBounds = [
      [
        centerCoords.lng - maxBoundsDistance,
        centerCoords.lat - maxBoundsDistance,
      ], // Southwest
      [
        centerCoords.lng + maxBoundsDistance,
        centerCoords.lat + maxBoundsDistance,
      ], // Northeast
    ];

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [centerCoords.lng, centerCoords.lat],
      zoom: 3,
      maxBounds: maxBounds,
      // showPlaceLabels:true,
    });

    mapRef.current = map;

    map.on("load", () => {
      map.addControl(new mapboxgl.NavigationControl(), "top-left");
    });

    // Create hover popup (but don't add to map yet)
    const hoverPopup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });
    hoverPopupRef.current = hoverPopup;

    map.on("load", () => {
      // Add 30-mile boundary circle source

      // Add postal code boundaries source
      map.addSource("postal-codes", {
        type: "geojson",
        data: dataset,
        promoteId: "ZCTA5CE10",
      });

      // Add postal code fill layer with dynamic coloring based on leads
      map.addLayer({
        id: "postal-code-fill",
        type: "fill",
        source: "postal-codes",
        paint: {
          "fill-color": [
            "case",
            [
              "has",
              ["get", "ZCTA5CE10"],
              ["literal", initialLeadsData?.Leads_data],
            ],
            [
              "case",
              // Check if leads >= 9, use special color
              [
                ">=",
                [
                  "get",
                  ["get", "ZCTA5CE10"],
                  [
                    "literal",
                    Object.fromEntries(
                      Object.entries(initialLeadsData?.Leads_data).map(
                        ([zip, data]) => [zip, data.total_leads]
                      )
                    ),
                  ],
                ],
                9,
              ],
              "#38761d",
              // Otherwise use the interpolated color scale for 0-8
              [
                "interpolate",
                ["linear"],
                [
                  "get",
                  ["get", "ZCTA5CE10"],
                  [
                    "literal",
                    Object.fromEntries(
                      Object.entries(initialLeadsData?.Leads_data).map(
                        ([zip, data]) => [zip, data.total_leads]
                      )
                    ),
                  ],
                ],
                0,
                "#b6d7a8",
                1,
                "#93c47d",
                2,
                "#93c47d",
                3,
                "#93c47d",
                4,
                "#6aa84f",
                5,
                "#6aa84f",
                6,
                "#6aa84f",
                7,
                "#38761d",
                8,
                "#38761d",
              ],
            ],
            "silver", // Very light gray for zipcodes not in our data
          ],
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0,
            [
              "case",
              ["has", ["get", "ZCTA5CE10"], ["literal", leadCounts]],
              0.9,
              0,
            ],
          ],
        },
      });

      // Add postal code borders
      map.addLayer({
        id: "postal-code-borders",
        type: "line",
        source: "postal-codes",
        paint: {
          // brighter color on hover, otherwise gray
          "line-color": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            "black",
            "#474747",
          ],
          // thicker on hover
          "line-width": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            1.5,
            0.5,
          ],
          "line-opacity": 1,
        },
      });

      // 1) Selected ZIP outline (initially hidden)
      map.addLayer({
        id: "postal-code-selected",
        type: "line",
        source: "postal-codes",
        filter: ["==", ["get", "ZCTA5CE10"], ""], // no selection yet
        paint: {
          "line-color": "#111",
          "line-width": 2,
          "line-opacity": 0.9,
        },
      });

      // Add center marker as a source and layer (more stable than Marker class)
      const pinIcon = createPinIcon("#000000");
      img.onload = () => {
        map.addImage("pin-icon", img);

        // Add center marker source
        map.addSource("center-marker", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [centerCoords.lng, centerCoords.lat],
            },
            properties: {
              description: "You are here!",
              zipcode: initialLeadsData.center.zipcode,
            },
          },
        });

        // Add center marker layer as symbol instead of circle
        map.addLayer({
          id: "center-marker-layer",
          type: "symbol",
          source: "center-marker",
          layout: {
            "icon-image": "pin-icon",
            "icon-size": 1,
            "icon-anchor": "bottom", // Anchor the pin at the bottom point
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
          },
        });
      };

      img.src = pinIcon;

      const boundaryCircle = {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            createCircleCoordinates(centerCoords.lng, centerCoords.lat, 30),
          ],
        },
      };

      map.addSource("boundary-circle", {
        type: "geojson",
        data: boundaryCircle,
      });

      // Add boundary circle layers
      map.addLayer({
        id: "boundary-circle-fill",
        type: "fill",
        source: "boundary-circle",
        paint: {
          "fill-color": "black",
          "fill-opacity": 0,
        },
      });

      map.addLayer({
        id: "boundary-circle-line",
        type: "line",
        source: "boundary-circle",
        paint: {
          "line-color": "black",
          "line-width": 2,
          "line-dasharray": [2, 2],
        },
      });

      // zoomout on esc press

      // Add center marker hover effects - FIXED VERSION
      map.on("mouseenter", "center-marker-layer", (e) => {
        map.getCanvas().style.cursor = "pointer";

        const coordinates = e.features[0].geometry.coordinates.slice();
        const zipcode = e.features[0].properties.zipcode;
        const city = e?.features[0].properties.city || "";

        // Remove any existing popup first
        hoverPopup.remove();

        // Show center marker popup
        hoverPopup
          .setLngLat(coordinates)
          .setHTML(
            `
            <div style="font-family: Arial, sans-serif; font-size: 12px; padding: 2px 2px;  border-radius: 4px; white-space: nowrap;">
            <strong style="color: #333;">You Are Here.   [ ${zipcode} ]</strong><br/>
            
            </div>
          `
          )
          .addTo(map);
      });

      map.on("mouseleave", "center-marker-layer", () => {
        map.getCanvas().style.cursor = "";
        hoverPopup.remove();
      });

      // 2) Cursor feedback
      map.on("mouseenter", "postal-code-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "postal-code-fill", () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("mousemove", "postal-code-fill", (e) => {
        // Check if we're hovering over the center marker first
        const centerMarkerFeatures = map.queryRenderedFeatures(e.point, {
          layers: ["center-marker-layer"],
        });

        // If we're over the center marker, don't show ZIP popup
        if (centerMarkerFeatures && centerMarkerFeatures.length > 0) {
          return;
        }

        const f = e.features && e.features[0];
        if (!f) return;

        const zip = f.properties?.ZCTA5CE10;
        const city = f.properties?.city;
        const leads = (leadCounts && leadCounts[zip]) ?? 0;
        // Calculate distance from center to the hover location

        const hoverLat = e.lngLat.lat;
        const hoverLng = e.lngLat.lng;
        const distance = calculateDistance(
          centerCoords.lat,
          centerCoords.lng,
          hoverLat,
          hoverLng
        );
        // Update feature state for styling
        if (hoveredZipId !== null) {
          map.setFeatureState(
            { source: "postal-codes", id: hoveredZipId },
            { hover: false }
          );
        }

        hoveredZipId = f.id;
        map.setFeatureState(
          { source: "postal-codes", id: hoveredZipId },
          { hover: true }
        );

        // Show hover popup with distance information
        hoverPopup
          .setLngLat(e.lngLat)
          .setOffset([0, 0])
          .setHTML(
            `
      <div style="font-family: Arial, sans-serif; font-size: 12px; padding: 2px 2px;  border-radius: 4px;  white-space: nowrap;">
        <strong style="color: #333;">ZIP ${zip} - ${city}</strong><br/>
        <span style="color: #666;">Leads: ${leads}</span><br/>
        <span style="color: #666;">Distance: ${distance.toFixed(1)} miles</span>
      </div>
    `
          )
          .addTo(map);
      });

      // Hide hover popup when mouse leaves zipcode area
      map.on("mouseleave", "postal-code-fill", () => {
        if (hoveredZipId !== null) {
          map.setFeatureState(
            { source: "postal-codes", id: hoveredZipId },
            { hover: false }
          );
        }
        hoveredZipId = null;

        // Remove hover popup
        hoverPopup.remove();
      });

      // 4) Click to focus + outline that ZIP (and optional popup)
      map.on("click", "postal-code-fill", (e) => {
        const f = e.features && e.features[0];
        if (!f) return;

        const zip = f.properties?.ZCTA5CE10;

        // highlight the clicked ZIP border
        map.setFilter("postal-code-selected", [
          "==",
          ["get", "ZCTA5CE10"],
          zip,
        ]);

        // compute bounds of (Multi)Polygon and fit
        const bounds = new mapboxgl.LngLatBounds();
        const add = (coords) => {
          if (!coords) return;
          if (typeof coords[0] === "number") {
            bounds.extend(coords);
          } else {
            coords.forEach(add);
          }
        };
        add(f.geometry.coordinates);

        map.fitBounds(bounds, { padding: 40, duration: 800 });

        // Set popup data for the selected zipcode
        const zipData = initialLeadsData.Leads_data[zip];
        const city = f?.["properties"]?.["city"];
        if (zipData) {
          // Calculate distance for the popup
          const clickLat = e.lngLat.lat;
          const clickLng = e.lngLat.lng;
          const distance = calculateDistance(
            centerCoords.lat,
            centerCoords.lng,
            clickLat,
            clickLng
          );

          setSelectedZipData({
            zipcode: zip,
            ...zipData,
            distance: distance,
            city: city,
          });
        } else {
          // If zipcode not in our data, show basic info
          const clickLat = e.lngLat.lat;
          const clickLng = e.lngLat.lng;
          const distance = calculateDistance(
            centerCoords.lat,
            centerCoords.lng,
            clickLat,
            clickLng
          );

          setSelectedZipData({
            city: city,
            zipcode: zip,
            total_leads: 0,
            total_active_prospects: 0,
            industry: [],
            leads: {
              cold: 0,
              warm: 0,
              hot: 0,
              reference: 0,
              not_intrested: 0,
            },
            distance: distance,
          });
        }
      });

      // 5) Click empty map to clear selection & reset view
      map.on("click", (e) => {
        const hit = map.queryRenderedFeatures(e.point, {
          layers: ["postal-code-fill"],
        });
        if (hit.length) return; // handled above

        map.setFilter("postal-code-selected", ["==", ["get", "ZCTA5CE10"], ""]);
        map.easeTo({
          center: [centerCoords.lng, centerCoords.lat],
          zoom: 10,
          duration: 600,
        });

        // Clear popup data
        // setSelectedZipData(null);
      });
    });

    return () => {
      if (hoverPopupRef.current) {
        hoverPopupRef.current.remove();
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [centerCoords, dataset]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && mapRef.current && centerCoords) {
        // Reset view to center coordinates
        mapRef.current.easeTo({
          center: [centerCoords.lng, centerCoords.lat],
          zoom: 8,
          duration: 600,
        });

        // Clear any selected ZIP
        mapRef.current.setFilter("postal-code-selected", [
          "==",
          ["get", "ZCTA5CE10"],
          "",
        ]);

        // Close popup if open
        setSelectedZipData(null);
      }
    };

    // Add event listener
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [centerCoords]); // Re-run when centerCoords changes

  // Function to create circle coordinates for boundary
  const createCircleCoordinates = (centerLng, centerLat, radiusMiles) => {
    const points = 64;
    const coords = [];

    // More accurate conversion taking latitude into account
    const latRadiusInDegrees = radiusMiles / 69; // 1 degree latitude ≈ 69 miles everywhere
    const lngRadiusInDegrees =
      radiusMiles / (69 * Math.cos((centerLat * Math.PI) / 180)); // Adjust for latitude

    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI;
      const x = centerLng + lngRadiusInDegrees * Math.cos(angle);
      const y = centerLat + latRadiusInDegrees * Math.sin(angle);
      coords.push([x, y]);
    }
    coords.push(coords[0]); // Close the polygon
    return coords;
  };

  // Function to close popup
  const closePopup = () => {
    setSelectedZipData(null);

    // Clear map selection
    if (mapRef.current) {
      mapRef.current.setFilter("postal-code-selected", [
        "==",
        ["get", "ZCTA5CE10"],
        "",
      ]);
      mapRef.current.easeTo({
        center: [centerCoords.lng, centerCoords.lat],
        zoom: 8,
        duration: 600,
      });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <div style={{ fontSize: "18px", marginBottom: "10px" }}>
          Loading map...
        </div>
        <div>
          Fetching coordinates for zipcode {initialLeadsData?.center?.zipcode}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      // <div style={{ padding: "20px", textAlign: "center", color: "green" }}>
      //   <div style={{ fontSize: "18px", marginBottom: "10px" }}>
      //     Failed to view map
      //   </div>
      //   {/* <div>{error}</div> */}
      // </div>
      <></>
    );
  }

  return initialLeadsData != undefined ? (
    <div className="relative">
      <div className="p-4 bg-white rounded-2xl shadow h-full">
        <div></div>

        <div className=" flex items-center gap-5 my-2 ">
          <div className=" flex items-center text-custom_black-500 font-medium">
            <span
              className="after:content-['']  rounded-lg mr-2 h-3 w-3 inline-block align-middle"
              style={{ backgroundColor: "#b6d7a8" }}
            ></span>
            <p className="text-[12px] text-[#667085]   ">0 Leads</p>
          </div>
          <div className=" flex items-center  text-custom_black-500 font-medium">
            <span
              className="after:content-['']  rounded-lg mr-2 h-3 w-3 inline-block align-middle"
              style={{ backgroundColor: "#93c47d" }}
            ></span>
            <p className="text-[12px] text-[#667085]  ">1-3 Leads</p>
          </div>
          <div className=" flex items-center  text-custom_black-500 font-medium">
            <span
              className="after:content-['']  rounded-lg mr-2 h-3 w-3 inline-block align-middle"
              style={{ backgroundColor: "#6aa84f" }}
            ></span>
            <p className="text-[12px] text-[#667085]  ">4-6 Leads</p>
          </div>
          <div className=" flex items-center text-custom_black-500 font-medium">
            <span
              className="after:content-['']  rounded-lg mr-2 h-3 w-3 inline-block align-middle"
              style={{ backgroundColor: "#38761d" }}
            ></span>
            <p className="text-[12px] text-[#667085]  ">7-8 Leads</p>
          </div>

          <div className=" flex items-center  text-custom_black-500 font-medium">
            <span
              className="after:content-['']  rounded-lg mr-2 h-3 w-3 inline-block align-middle"
              style={{ backgroundColor: "#38761d" }}
            ></span>
            <p className="text-[12px] text-[#667085]  ">9 and Above Leads</p>
          </div>
          <div className=" flex items-center  text-custom_black-500 font-medium">
            {/* image */}
            <img
              src={createPinIcon("black")}
              alt="Pin Icon"
              className="w-4 h-6"
            />
            <p className="text-[12px] text-[#667085]  ">Your Location</p>
          </div>
          <div className=" flex items-center  text-custom_black-500 font-medium">
            <span className=" w-5 h-5 rounded-full border-[2px] border-dashed border-[#0c0c0c] mr-2"></span>
            <p className="text-[12px] text-[#667085]  ">30 Miles Boundary</p>
          </div>
        </div>
        <div
          ref={mapContainerRef}
          style={{
            width: "100%",
            height: "80vh",
            marginBottom: "20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        />
      </div>

      {/* Right Side Popup */}
      {selectedZipData && (
        <div className="absolute top-[5.4rem] right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 pt-0 w-80 max-h-96 overflow-y-auto z-10">
          {/* Header with close button */}
          <div className=" sticky top-0 bg-white flex justify-between items-center mb-3 pb-2 border-b border-gray-200 pt-4">
            <div className="flex  items-center gap-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedZipData.zipcode}
                </h3>
              </div>
              <div>
                <h3 className="text-md font-normal text-gray-800">
                  ({selectedZipData.city})
                </h3>
              </div>
            </div>
            <button
              onClick={closePopup}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Basic Info */}
          <div className="space-y-3">
            <div className="bg-gray-50 rounded p-2">
              <div className="text-sm text-gray-600">
                Distance from your location
              </div>
              <div className="text-lg font-semibold text-gray-800">
                {selectedZipData.distance?.toFixed(1)} miles
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-blue-50 rounded p-2">
                <div className="text-sm text-gray-600">Total Leads</div>
                <div className="text-xl font-bold text-blue-600">
                  {selectedZipData.total_leads}
                </div>
              </div>
              <div className="bg-green-50 rounded p-2">
                <div className="text-sm text-gray-600">Active Prospects</div>
                <div className="text-xl font-bold text-green-600">
                  {selectedZipData.total_active_prospects}
                </div>
              </div>
            </div>

            {/* Lead Breakdown */}
            {selectedZipData.total_leads != 0 &&
              Object.keys(selectedZipData.leads)?.length != 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2 underline underline-offset-[2.5px] ">
                    Lead Breakdown
                  </div>
                  <div className="space-y-1 text-sm">
                    {Object.keys(selectedZipData.leads)?.map((el) => (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {`${el?.split("")[0]?.toUpperCase()}${el
                            ?.split("")
                            ?.slice(1)
                            .join("")
                            ?.toLowerCase()} `}
                          :
                        </span>
                        <span className="font-medium">
                          {selectedZipData.leads?.[el] || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            {/* Industries */}
            {selectedZipData.industry &&
              selectedZipData.industry.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2 underline underline-offset-[2.5px]">
                    Industries
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedZipData.industry.map((industry, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {industry}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  ) : (
    <></>
  );
}

export default PostalCodeMap;
