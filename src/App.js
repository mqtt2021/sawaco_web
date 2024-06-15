import './App.scss';
import React, { useState,useEffect,useRef} from "react";
import { MapContainer, TileLayer,Marker, Popup,useMapEvent,useMap   } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet'
import "leaflet/dist/leaflet.css";
import * as signalR from "@microsoft/signalr";
import mqtt from 'mqtt';

function App() {

  // const isInitialRender = useRef(true);

  const [ZOOM_LEVEL,setZOOM_LEVEL] = useState(17);
  const [datalogger,setDatalogger] = useState({lat:  10.772785, lng : 106.659763})
  const [center, setCenter] = useState({ lat:  10.771785, lng : 106.658763 });
  const mapRef = useRef();
  
  const [count, setcount] = useState(0);
  const [previoucount, setprevioucount] = useState(0);
  const [timeStamp, settimeStamp] = useState('');


  const wakeup = new L.Icon({
    iconUrl: require("./asset/images/position.png" ),
    iconSize: [40,50],
    iconAnchor: [20, 45],         
    popupAnchor: [0, -45], 
  })
  const disconnect = new L.Icon({
    iconUrl: require("./asset/images/disconnect.png" ),
    iconSize: [40,50],
    iconAnchor: [20, 45],         
    popupAnchor: [0, -45], 
  })

const client = mqtt.connect('wss://mqtt.eclipseprojects.io:443/mqtt');

useEffect(() => { 
      client.on('connect', () => {
      console.log("connected");
      client.subscribe("SAWACO/STM32/Latitude");
      client.subscribe("SAWACO/STM32/Longitude");
    });
}, [])

let array = []

client.on('message', (topic, message) => {
  
  if (topic === 'SAWACO/STM32/Latitude') {
    const jsonDatalat = JSON.parse(message.toString());
    array.push(jsonDatalat)
    console.log(jsonDatalat)
   
  }    
  if(topic === 'SAWACO/STM32/Longitude'){
    const jsonDatalng = JSON.parse(message.toString());
    array.push(jsonDatalng)
    console.log(jsonDatalng)
  }

  if(array.length === 2){
    if(parseFloat(array[0].value)>0){
            setcount( pre => pre + 1 )
            settimeStamp(array[0].timestamp)
            setDatalogger({ lat:  parseFloat(array[0].value),  lng:  parseFloat(array[1].value)})                      
            console.log(array)
            array = [] 
    }                
  }
});

// useEffect(() => {
//   console.log('UseEffect Begin')
//   let storedData = localStorage.getItem('datalogger');
//   if (storedData) {
//     setDatalogger(JSON.parse(storedData));
//   }
// }, []);

// useEffect(()=>{
//   let dataArray = []
//   let i = 0
//   let connection = new signalR.HubConnectionBuilder()
//       .withUrl("https://testsawacogps.azurewebsites.net/NotificationHub")
//       .withAutomaticReconnect()
//       .build();
//   // Bắt đầu kết nối
//   connection.start()
//       .then(() => {
//           console.log('Kết nối thành công!');
//       })
//       .catch(err => {
//           console.error('Kết nối thất bại: ', err);
//       });
//   // Lắng nghe sự kiện kết nối lại
//   connection.onreconnected(connectionId => {
//       console.log(`Kết nối lại thành công. Connection ID: ${connectionId}`);
//   });
//   // Lắng nghe sự kiện đang kết nối lại
//   connection.onreconnecting(error => {
//       console.warn('Kết nối đang được thử lại...', error);
//   });
//   connection.on("GetAll", data => {
//     dataArray.push(JSON.parse(data))
//     i++
//     if(i===2){
//       console.log('lat',parseFloat(dataArray[0].Value))
//       console.log('lng',parseFloat(dataArray[1].Value))
//       setDatalogger({lat:parseFloat(dataArray[0].Value),lng:parseFloat(dataArray[1].Value)})
//       i = 0
//       dataArray = []
//     }
//   });
// },[])

const handleMapClickGetLocation = (e) => {
  console.log('lat: '+ e.latlng.lat)
  console.log('lng: '+ e.latlng.lng)
};

useEffect(() => { // Cập nhật bản đồ với giá trị mới của center và ZOOM_LEVEL
  if (mapRef.current) {
        mapRef.current.setView(center, ZOOM_LEVEL);
  }
}, [center]);

useEffect(() => {
    // console.log('datalogger Chance',datalogger)
    setCenter({ lat:  datalogger.lat, lng : datalogger.lng })
    // localStorage.setItem('datalogger', JSON.stringify(datalogger));
}, [datalogger]);

// useEffect(() => {
//   let i = 1
//   const interval = setInterval(() => {
//     i++
//     if(i===1){
//       setDatalogger({lat:10.77073376363716,lng:106.65862138935935});
//     }  
//     else if(i===2){
//       setDatalogger({lat:10.772950722507412,lng:106.66094404201701});
//     }
//     else{
//       i=0
//       setDatalogger({lat:10.771785,lng:106.658763 });
//     }
    
//   }, 300000);

//   return () => clearInterval(interval);
// }, []);

  return (
    <div className='App'>
                  <div className='title'>
                          <div>HỆ THỐNG GIÁM SÁT DATALOGGER</div>
                          {/* <div>{count}</div> */}
                  </div>
                  
                    <MapContainer 
                          center={center} 
                          zoom={ZOOM_LEVEL}     
                          ref={mapRef}>
                        <TileLayer
                             attribution ='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            
                        />
                        <MyClickHandlerGetLocation onClick={handleMapClickGetLocation}/>
                        
                                <Marker 
                                  className='maker'
                                  position={[datalogger.lat,datalogger.lng]}
                                  icon= { wakeup }                                
                                >
                                    <Popup>
                                            {`lat:${datalogger.lat} - lng:${datalogger.lng} - ${timeStamp}`}                                         
                                                                           
                                    </Popup>    
                                </Marker>
                        
                                                       
                    </MapContainer>
                  
                      
                   
    </div>
  );
}
function MyClickHandlerGetLocation({ onClick }) {
  const map = useMapEvent('click', (e) => {
    onClick(e);
  });
  
  return null;
  }
export default App;
