import './App.scss';
import React, { useState,useEffect,useRef} from "react";
import { MapContainer, TileLayer,Marker, Popup,useMapEvent,useMap   } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet'
import "leaflet/dist/leaflet.css";
import * as signalR from "@microsoft/signalr";

function App() {

  const isInitialRender = useRef(true);

  console.log('Begin')
  const [ZOOM_LEVEL,setZOOM_LEVEL] = useState(17);
  const [datalogger,setDatalogger] = useState({lat:  10.771785, lng : 106.658763})
  const [center, setCenter] = useState({ lat:  10.771785, lng : 106.658763 });
  const mapRef = useRef();
  
  const wakeup = new L.Icon({
    iconUrl: require("./asset/images/position.png" ),
    iconSize: [40,50],
    iconAnchor: [15, 35],
    popupAnchor: [6, -35], 
  })

// const client = mqtt.connect('wss://mqtt.eclipseprojects.io:443/mqtt');
// useEffect(() => { 
//       client.on('connect', () => {
//       console.log("connected");
//       client.subscribe("SAWACO");
//     });
// }, [])
// client.on('message', (topic, message) => {
//   if (topic === 'SAWACO') {
//     const data = message.toString()
//     console.log('data',data)
//     // const jsonData = JSON.parse(message.toString());
//     // 073726.000,1046.309968,N,10639.533136,E,1,6,2.81,18.708,M,2.288,M,,*4C
//     const mangdauphay = []
//     for(let i = 0 ; i < data.length;i++){
//       if(data[i] === ','){
//         mangdauphay.push(i)
//       }
//     }
//     const lat = parseFloat(data.slice(mangdauphay[0]+1,mangdauphay[1]))/100+0.3085
//     const lng = parseFloat(data.slice(mangdauphay[2]+1,mangdauphay[3]))/100+0.263597
//     if(lat === NaN || lng === NaN){  
//       setDatalogger({
//         lat:  10.767542921678812, 
//         lng: 106.65888405789089 ,
//       })
//     }
//     else{
//        setDatalogger({
//       lat:  lat, 
//       lng: lng ,
//     })
//     }
//   }    
// });

useEffect(() => {
  console.log('UseEffect Begin')
  let storedData = localStorage.getItem('datalogger');
  if (storedData) {
    setDatalogger(JSON.parse(storedData));
  }
}, []);

useEffect(()=>{

  let dataArray = []
  let i = 0

  let connection = new signalR.HubConnectionBuilder()
      .withUrl("https://testsawacogps.azurewebsites.net/NotificationHub")
      .withAutomaticReconnect()
      .build();
  // Bắt đầu kết nối
  connection.start()
      .then(() => {
          console.log('Kết nối thành công!');
      })
      .catch(err => {
          console.error('Kết nối thất bại: ', err);
      });
  // Lắng nghe sự kiện kết nối lại
  connection.onreconnected(connectionId => {
      console.log(`Kết nối lại thành công. Connection ID: ${connectionId}`);
  });
  // Lắng nghe sự kiện đang kết nối lại
  connection.onreconnecting(error => {
      console.warn('Kết nối đang được thử lại...', error);
  });

  connection.on("GetAll", data => {

    dataArray.push(JSON.parse(data))
    
    i++
    if(i===2){
      console.log('lat',parseFloat(dataArray[0].Value))
      console.log('lng',parseFloat(dataArray[1].Value))
      setDatalogger({lat:parseFloat(dataArray[0].Value),lng:parseFloat(dataArray[1].Value)})
      i = 0
      dataArray = []
    }
  });

},[])

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
  if (isInitialRender.current) {// Ngăn không cho `useEffect` chạy lần đầu tiên
    isInitialRender.current = false;
    return; 
  }
    console.log('datalogger Chance',datalogger)
    setCenter({ lat:  datalogger.lat, lng : datalogger.lng })
    localStorage.setItem('datalogger', JSON.stringify(datalogger));
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


console.log(datalogger)

  return (
    <div className='App'>
                  <div className='title'>
                          HỆ THỐNG GIÁM SÁT DATALOGGER
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
                                  icon={wakeup}                                
                                >
                                    <Popup>
                                            {`lat:${datalogger.lat} - lng:${datalogger.lng}`}                                         
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
