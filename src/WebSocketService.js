class WebSocketService {
  constructor() {
    this.websocket = null;
  }

  connect(url, messageHandlers, onError, onClose, onOpen, initialMessage) {
    if (this.websocket !== null && this.websocket.readyState === WebSocket.OPEN) {
      console.log("WebSocket is already connected.");
      return;
    }

    // Crea un nuevo WebSocket solo si no existe o no está ya abierto
    this.websocket = new WebSocket(url);

    this.websocket.onopen = () => {
      console.log("WebSocket connection established.");
      // Verifica que el WebSocket esté listo antes de enviar
      if (this.websocket && initialMessage && this.websocket.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify(initialMessage));
      }
      if (onOpen) {
        onOpen();
      }
    };

    this.websocket.onmessage = event => {
      const data = JSON.parse(event.data);
      if (data.type && messageHandlers[data.type]) {
        messageHandlers[data.type](data);
      } else {
        console.log("Unhandled event type:", data.type);
      }
    };

    this.websocket.onerror = error => {
      console.error("WebSocket error:", error);
      if (onError) {
        onError(error);
      }
    };

    this.websocket.onclose = event => {
      console.log("WebSocket connection closed:", event);
      if (onClose) {
        onClose(event);
      }
      this.websocket = null;
    };
  }

  sendMessage(message) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    } else {
      console.log("Cannot send message. WebSocket is not connected or not ready.");
    }
  }

  close() {
    if (this.websocket !== null) {
      this.websocket.close();
    }
  }
}

export default new WebSocketService();
