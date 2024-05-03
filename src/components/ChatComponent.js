import React, { useEffect, useRef, useState } from 'react';
import { Container, ListGroup, Form, Button, InputGroup, Navbar } from 'react-bootstrap';
import WebSocketService from '../WebSocketService';

const ChatComponent = ({ messages }) => {
  const [newMessage, setNewMessage] = useState(''); 
  const endOfMessagesRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() !== '') {
      const messageData = {
        type: "MESSAGE",
        payload: {
          content: newMessage
        }
      };
      WebSocketService.sendMessage(messageData);  // Envia el mensaje al WebSocket
      console.log("mensaje enviado", messageData);
      setNewMessage('');  // Limpia el campo de entrada
    }
  };

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
  };

  return (
    <Container fluid className="p-0" style={{ height: '10%' }}>
      <Navbar bg="light" variant="light" className="justify-content-center">
        <Navbar.Brand style={{ fontWeight: 'bold' }}>Chat</Navbar.Brand>
      </Navbar>
      <ListGroup variant="flush" ref={messagesContainerRef} style={{ overflowY: 'auto', maxHeight: '40vh' }}>
        {messages.map((msg, index) => (
          <ListGroup.Item key={index} className="border-0">
            <strong>{msg.sender}</strong> <small className="text-muted">{new Date(msg.timestamp).toLocaleString()}</small>
            <p>{msg.content}</p>
          </ListGroup.Item>
        ))}
        <div ref={endOfMessagesRef} />
      </ListGroup>
      <Form onSubmit={handleSendMessage} className="mt-2">
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Write a message..."
            value={newMessage}
            onChange={handleMessageChange}
          />
          <Button variant="primary" type="submit">
            Send
          </Button>
        </InputGroup>
      </Form>
    </Container>
  );
};
export default ChatComponent;