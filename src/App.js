import MapComponent from './components/MapComponent';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col } from 'react-bootstrap';
import LogoMetro from './logo-metro.png'; 

function App() {
  return (
    <div className="App">
      <Container className="text-center my-3">
        <Row className="justify-content-center align-items-center">
          
          <Col xs="auto">
            <h1 style={{ fontFamily: 'Sans-serif', fontWeight: 'bold', fontSize: '24px' }}>METRAPI</h1>
          </Col>
          <Col xs="auto">
            <img src={LogoMetro} alt="Metro" style={{ width: '5vh', marginBottom: '1vh'}} />
          </Col>
        </Row>
      </Container>
      <MapComponent />
    </div>
  );
}
export default App;
