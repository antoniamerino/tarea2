import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconUrl from '../red.png'; 
import WebSocketService from '../WebSocketService';
import iconTrain from '../trenNegro.png';
import iconStopped from '../trenAmarillo.png';
import iconDeparting from '../trenVerde.png';
import iconTraveling from '../trenNegro.png';
import iconArrived from '../trenRojo.png';
import { Container, Row, Col, Table } from 'react-bootstrap';
import ChatComponent from './ChatComponent';

const MapComponent = () => {
  const mapRef = useRef({ leafletElement: null }); 
  const [linesInfo, setLinesInfo] = useState([]); 
  const [trainData, setTrainData] = useState({}); 
  const [stations, setStations] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    initializeMap().then(map => {
      if (map) {
        fetchStationsAndLines(map).then(() => {
          fetchInitialTrainData(map).then(() => {
            setupWebSocket(map);
            setInterval(() => {
              checkTrainStatus(map); // Verifica el estado de los trenes
            }, 10000); // Cada 10 segundos
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
    setStations(stations);
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
      const initialPosition = { lat: -33.45, lng: -70.65 };
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
        [train.train_id]: {
          ...train,
          marker,
          positions: [], // Inicializar el arreglo de posiciones vacio
          currentStation: null // Inicializar currentStation como null
        }
      }));
    });
  };

  const checkTrainStatus = async (map) => {
    const response = await fetch('https://tarea-2.2024-1.tallerdeintegracion.cl/api/metro/trains');
    const activeTrains = await response.json();
    const activeTrainIds = new Set(activeTrains.map(train => train.train_id));
  
    setTrainData(prevData => {
      Object.keys(prevData).forEach(trainId => {
        if (!activeTrainIds.has(trainId)) {
          // Eliminar el tren si ya no está activo
          if (prevData[trainId].path) {
            prevData[trainId].path.remove(); // Elimina la línea del mapa
          }
          if (prevData[trainId].marker) {
            prevData[trainId].marker.remove(); // Elimina el marcador del mapa
          }
          delete prevData[trainId]; // Elimina el tren de los datos
        }
      });
      return { ...prevData };
    });
  };
  
  const setupWebSocket = (map) => {
    WebSocketService.connect(
      "wss://tarea-2.2024-1.tallerdeintegracion.cl/connect",
      {
        position: data => handlePositionEvent(data, map),
        status: data => handleStatusEvent(data, map),
        arrival: data => handleArrivalEvent(data, map),
        departure: data => console.log(`Departure: ${data.data}`),
        message: data => handleChatMessage(data)
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
      if (train) {
        if (!train.positions.length) { 
          train.positions.push([position.lat, position.long]);
          train.path = L.polyline(train.positions, {
            color: 'black',
            dashArray: '5, 10' 
          }).addTo(map);
        } else {
          train.positions.push([position.lat, position.long]);
          train.path.setLatLngs(train.positions);
        }
        train.marker.setLatLng([position.lat, position.long]);
      }
      return { ...prevData };
    });
  };

  const handleStatusEvent = (data, map) => {
    const { train_id, status } = data.data;

    setTrainData(prevData => {
      const train = prevData[train_id];
      if (train) {
        let iconUrl;
        switch (status) {
          case 'stopped':
            iconUrl = iconStopped;
            break;
          case 'departing':
            iconUrl = iconDeparting;
            break;
          case 'traveling':
            iconUrl = iconTraveling;
            break;
          case 'arrived':
            iconUrl = iconArrived;
            break;
          default:
            iconUrl = iconTrain;
        }
        const newIcon = L.icon({
          iconUrl,
          iconSize: [20, 30],
          iconAnchor: [10, 15]
        });
        train.marker.setIcon(newIcon);
        train.marker.bindPopup(
          `Train ID: ${train.train_id}<br>` +
          `Status: ${status}<br>` +
          `Line: ${train.line_id}<br>` +
          `Driver: ${train.driver_name}<br>` +
          `Origin: ${train.origin_station_id}<br>` +
          `Destination: ${train.destination_station_id}`
        );
      }
      return { ...prevData };
    });
  };

  const handleArrivalEvent = (data, map) => {
    const { train_id, station_id, line_id } = data.data;
  
    setTrainData(prevData => {
      const train = prevData[train_id];
      if (train) {
        // Forma la clave única para la estación actual
        const uniqueStationKey = `${station_id}-${line_id}`;
        const updatedTrain = {
          ...train,
          currentStation: uniqueStationKey
        };
        return {
          ...prevData,
          [train_id]: updatedTrain
        };
      }
      return prevData;
    });
  }; 
  
  const handleChatMessage = (data) => {
    const { train_id, content, name } = data.data;
    const message = {
      sender: name,
      content: content,
      timestamp: new Date(data.timestamp),
      trainId: train_id,
      level: data.data.level
    };
  
    setChatMessages(prevMessages => [...prevMessages, message]);
  };
  
  const cleanupMap = () => {
    Object.values(trainData).forEach(train => {
      if (train.path) train.path.remove();
      train.marker.remove();
    });
    if (mapRef.current && mapRef.current.leafletElement) {
      mapRef.current.leafletElement.remove();
      mapRef.current.leafletElement = null;
    }
  };

  return (
    <Container fluid className="p-0" style={{ height: '100vh' }}>
  
      <Row>
        <Col md={8} className="p-0">
          <div ref={mapRef} style={{ height: '55vh' }}>Map Here</div>
        </Col>
        <Col md={4} className="p-0" style={{ height: '55vh' }}> 
          <ChatComponent messages={chatMessages} />
        </Col>
      </Row>

  
      <Row className="mt-3">
        <Col md={4}>
          <Table striped bordered hover responsive className="text-center">
            <caption style={{ captionSide: 'top', fontWeight: 'bold', textAlign: 'center' }}>Estaciones</caption>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>ID</th>
                <th>Línea</th>
              </tr>
            </thead>
            <tbody>
              {stations.map(station => (
                <tr key={`${station.station_id}-${station.line_id}`}>
                  <td>{station.name}</td>
                  <td>{station.station_id}</td>
                  <td>{station.line_id}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
        <Col md={4}>
          <Table striped bordered hover responsive className="text-center">
            <caption style={{ captionSide: 'top', fontWeight: 'bold', textAlign: 'center' }}>Trenes</caption>
            <thead>
              <tr>
                <th>ID</th>
                <th>Chofer</th>
                <th>Origen</th>
                <th>Destino</th>
                <th>Estación actual</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(trainData).map(train => (
                <tr key={train.train_id}>
                  <td>{train.train_id}</td>
                  <td>{train.driver_name}</td>
                  <td>{train.origin_station_id}</td>
                  <td>{train.destination_station_id}</td>
                  <td>{stations.find(s => `${s.station_id}-${s.line_id}` === train.currentStation)?.station_id || '-'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
        <Col md={4}>
          <Table bordered hover responsive className="text-center">
            <caption style={{ captionSide: 'top', fontWeight: 'bold', textAlign: 'center' }}>Estado del Tren</caption>
            <thead>
              <tr>
                <th>Estado</th>
                <th>Icono</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Viajando</td>
                <td><img src={iconTraveling} alt="Viajando" style={{ width: '50px' }} /></td>
              </tr>
              <tr>
                <td>Llegado</td>
                <td><img src={iconArrived} alt="Llegado" style={{ width: '50px' }} /></td>
              </tr>
              <tr>
                <td>Saliendo</td>
                <td><img src={iconDeparting} alt="Saliendo" style={{ width: '50px' }} /></td>
              </tr>
              <tr>
                <td>Detenido</td>
                <td><img src={iconStopped} alt="Detenido" style={{ width: '50px' }} /></td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};
export default MapComponent;