import React, { useEffect } from 'react';

function WebSocketConnection() {
  useEffect(() => {
    const url = "wss://tarea-2.2024-1.tallerdeintegracion.cl/connect";
    const websocket = new WebSocket(url);
    const payload = {
      "type": "JOIN",
      "payload": {
        "id": "19641443",  // Asegúrate de reemplazar esto con tu número de alumno
        "username": "antoniamerino"  // Asegúrate de reemplazar esto con tu nombre de usuario
      }
    };

    websocket.onopen = () => {
      console.log(`Connecting to: ${url}. Sending:`, payload);
      websocket.send(JSON.stringify(payload));
    };

    websocket.addEventListener("message", ({ data }) => {
      const event = JSON.parse(data);
      console.log(`Got ${event.type} event:`, event);
    });

    return () => websocket.close();
  }, []);

  return <div>WebSocket Connection Established</div>;
}

export default WebSocketConnection;