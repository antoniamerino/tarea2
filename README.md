# MetraPI - Visualización en Tiempo Real del Metro de Santiago

## Descripción del Proyecto
MetraPI es una aplicación web desarrollada para visualizar en tiempo real la información del metro de Santiago, Chile. Utiliza WebSockets para recibir y mostrar datos en tiempo real sobre la posición de los trenes, las estaciones, y las líneas del metro. Adicionalmente, incluye un sistema de chat que permite a los usuarios enviar y recibir mensajes en tiempo real.

## Tecnologías Utilizadas
- **React**: Utilizado para construir la interfaz de usuario.
- **Leaflet**: Librería de mapas interactivos.
- **Bootstrap**: Utilizado para estilizar y organizar los componentes de la interfaz gráfica.
- **WebSocket API**: Para la comunicación en tiempo real con el servidor y recibir eventos del metro.

## Funcionalidades
- **Visualización de Mapas**: Muestra las estaciones de metro y las rutas utilizando diferentes colores para cada línea.
- **Actualización en Tiempo Real**: Los trenes se actualizan en el mapa conforme se reciben datos nuevos a través de eventos WebSocket. Los estados de los trenes se pueden visualizar con cambios de colores de los iconos de los trenes. 
- **Chat en Tiempo Real**: Permite a los usuarios comunicarse entre sí y recibir mensajes automáticos relacionados con los eventos del metro.
- **Tablas Informativas**: Se presentan tablas que muestran información detallada sobre las estaciones y los trenes, incluyendo datos como nombre de estación, ID, línea, estado actual del tren, chofer, origen y destino.

## Bibliografía y Recursos
- Íconos del metro utilizados bajo licencia de Flaticon: [Logotipo del metro de Santiago](https://www.flaticon.es/icono-gratis/logotipo-del-metro-de-santiago_50835)
- Otros íconos de metro obtenidos de Iconos8: [Iconos de trenes](https://iconos8.es/icons/set/metro)
- Tutoriales y ejemplos sobre proyectos similares:
  - [Tutorial de YouTube sobre mapas](https://www.youtube.com/watch?v=F8dnYNTncoU)
  - [Repositorio de GitHub con ejemplos de aplicación de mapas](https://github.com/ruvictor/map-app-directions/tree/master)
- **ChatGPT de OpenAI**: Asistencia en la estructura del código, resolución de dudas y diseño de la interfaz gráfica.

## Uso
Para iniciar el proyecto localmente, sigue estos pasos:
1. Clona el repositorio.
2. Instala las dependencias con `npm install`.
3. Ejecuta el servidor local con `npm start`.