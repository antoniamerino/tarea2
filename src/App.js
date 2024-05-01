import MapComponent from './components/MapComponent';
import './App.css';
import 'leaflet/dist/leaflet.css';

function App() {
  return (
    <div className="App">
      <h1>Estaciones de Metro en Santiago</h1>
      <MapComponent />
    </div>
  );
}

export default App;
