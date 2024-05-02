import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconUrl from '../red.png'; // Verifica que la ruta al icono es correcta
import WebSocketService from '../WebSocketService';
import iconTrain from '../icon-station.png';

const MapComponent = () => {
  const mapRef = useRef({ leafletElement: null }); // Ref para mantener la referencia al mapa
  const [linesInfo, setLinesInfo] = useState([]); // Información sobre las líneas de metro
  const [trainData, setTrainData] = useState({}); // Datos de los trenes

  useEffect(() => {
    initializeMap().then(map => {
      if (map) {
        fetchStationsAndLines(map).then(() => {
          fetchInitialTrainData(map).then(() => {
            // Conectar el WebSocket solo después de que todo esté cargado
            setupWebSocket(map);
          });
        });
      }
    });

    return () => {
      cleanupMap();
      WebSocketService.close();
    };
  }, []);

  const initializeMap = () => {
    return new Promise(resolve => {
      if (!mapRef.current) {
        console.error("Map container is not available");
        resolve(null);
        return;
      }

      const map = L.map(mapRef.current, {
        center: [-33.45, -70.65],
        zoom: 12
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).on('load', () => resolve(map)).addTo(map);
    });
  };

  const fetchStationsAndLines = async (map) => {
    const stationsResponse = await fetch('https://tarea-2.2024-1.tallerdeintegracion.cl/api/metro/stations');
    const stations = await stationsResponse.json();
    const stationDict = {};
    stations.forEach(station => {
      const key = `${station.station_id}-${station.line_id}`;
      stationDict[key] = station.position;
      const customIcon = L.icon({
        iconUrl: iconUrl,
        iconSize: [10, 15],
        iconAnchor: [10, 10],
        popupAnchor: [1, -10]
      });

      const marker = L.marker([station.position.lat, station.position.long], { icon: customIcon }).addTo(map);
      marker.bindPopup(`<b>${station.name}</b><br>ID: ${station.station_id}<br>Line: ${station.line_id}`);
    });

    const linesResponse = await fetch('https://tarea-2.2024-1.tallerdeintegracion.cl/api/metro/lines');
    const lines = await linesResponse.json();
    setLinesInfo(lines);
    lines.forEach(line => {
      const lineCoordinates = line.station_ids.map(id => {
        const key = `${id}-${line.line_id}`;
        return [stationDict[key].lat, stationDict[key].long];
      });
      L.polyline(lineCoordinates, { color: line.color }).addTo(map);
    });
  };

  const fetchInitialTrainData = async (map) => {
    const response = await fetch('https://tarea-2.2024-1.tallerdeintegracion.cl/api/metro/trains');
    const trains = await response.json();

    trains.forEach(train => {
      const initialPosition = { lat: -33.45, lng: -70.65 }; // Posición inicial para todos los trenes
      const trainIcon = L.icon({
        iconUrl: iconTrain,
        iconSize: [20, 30],
        iconAnchor: [10, 15]
      });
      const marker = L.marker(initialPosition, { icon: trainIcon }).addTo(map);
      marker.bindPopup(
        `Train ID: ${train.train_id}<br>` +
        `Linea: ${train.line_id}<br>` +
        `Conductor: ${train.driver_name}<br>` +
        `Origen: ${train.origin_station_id}<br>` +
        `Destino: ${train.destination_station_id}`
      );

      setTrainData(prevData => ({
        ...prevData,
        [train.train_id]: { ...train, marker }
      }));
    });
  };

  const setupWebSocket = (map) => {
    WebSocketService.connect(
      "wss://tarea-2.2024-1.tallerdeintegracion.cl/connect",
      {
        position: data => handlePositionEvent(data, map),
        status: data => console.log(`Status: ${data.data.status}`),
        arrival: data => console.log(`Arrival: ${data.data}`),
        departure: data => console.log(`Departure: ${data.data}`)
      },
      error => console.error("WebSocket Error: ", error),
      () => console.log("WebSocket Connection Closed"),
      () => console.log("WebSocket Connection Established"),
      {
        "type": "JOIN",
        "payload": {
          "id": "19641443",
          "username": "antoniamerino"
        }
      }
    );
  };

  const handlePositionEvent = (data, map) => {
    const { train_id, position } = data.data;

    setTrainData(prevData => {
      const train = prevData[train_id];
      if (train && train.marker) {
        train.marker.setLatLng([position.lat, position.long]);
      }
      return prevData;
    });
  };
  

  const cleanupMap = () => {
    Object.values(trainData).forEach(train => train.marker.remove());
    if (mapRef.current && mapRef.current.leafletElement) {
      mapRef.current.leafletElement.remove();
      mapRef.current.leafletElement = null;
    }
  };

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