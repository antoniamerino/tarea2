import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconUrl from '../red.png';

const MapComponent = () => {
  const mapRef = useRef(null); // Ref para mantener la referencia al mapa
  const [linesInfo, setLinesInfo] = useState([]);

  useEffect(() => {
    let map;
    // Verificar si el mapa ya fue inicializado
    if (!mapRef.current.leafletElement) {
      // Crear una instancia del mapa
      map = L.map(mapRef.current, {
        center: [-33.45, -70.65],
        zoom: 12
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapRef.current.leafletElement = map; // Asignar la instancia del mapa al elemento ref
    } else {
      map = mapRef.current.leafletElement;
    }

    // Función para cargar y añadir marcadores al mapa
    async function fetchStations() {
        const response = await fetch('https://tarea-2.2024-1.tallerdeintegracion.cl/api/metro/stations');
        const stations = await response.json();
        const stationDict = {};
        stations.forEach(station => {
            const key = `${station.station_id}-${station.line_id}`;
            stationDict[key] = station.position;
            const customIcon = L.icon({
                iconUrl: iconUrl,
                iconSize: [15, 25], // Asegúrate de que estas medidas coincidan con las dimensiones de tu icono
                iconAnchor: [12, 41],
                popupAnchor: [1, -34]
                });
          
            const marker = L.marker([station.position.lat, station.position.long], { icon: customIcon }).addTo(map);
            marker.bindPopup(`<b>${station.name}</b><br>ID: ${station.station_id}<br>Line: ${station.line_id}`);
        });

        fetchLines(stationDict);
    }

    async function fetchLines(stationDict) {
        const response = await fetch('https://tarea-2.2024-1.tallerdeintegracion.cl/api/metro/lines');
        const lines = await response.json();
        setLinesInfo(lines);
        lines.forEach(line => {
            const lineCoordinates = line.station_ids.map(id => {
            const key = `${id}-${line.line_id}`;
            return [stationDict[key].lat, stationDict[key].long];
            });
            const polyline = L.polyline(lineCoordinates, { color: line.color }).addTo(map);
        });
    }
  
    fetchStations();

    return () => {
      if (mapRef.current && mapRef.current.leafletElement) {
        mapRef.current.leafletElement.remove();
        mapRef.current.leafletElement = null; // Limpieza de la referencia
      }
    };
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div ref={mapRef} style={{ height: '70%', width: '50%', marginLeft: '5vh' }} />
      <div style={{ width: '50%', overflowY: 'auto', padding: '20px' }}>
        <h1>Mapa y Datos</h1>
        {linesInfo.map(line => (
          <div key={line.line_id}>
            <strong>Line {line.line_id}:</strong> Color {line.color}
            <p>Stations: {line.station_ids.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapComponent;