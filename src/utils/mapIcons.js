// src/utils/mapIcons.js
import L from 'leaflet';

// (URL ของรูปภาพ Icon จาก CDN)
const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png';

// (หมุดสีฟ้า: สำหรับ 'shop')
export const blueIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// (หมุดสีเขียว: สำหรับ 'booth')
export const greenIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// (หมุดสีเทา: สำหรับ 'pending' หรือ 'center')
export const greyIcon = new L.Icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// (ฟังก์ชัน Helper ไว้เลือก Icon)
export const getIcon = (type) => {
  if (type === 'booth') {
    return greenIcon;
  }
  // (ค่าเริ่มต้นคือ 'shop' หรืออื่นๆ)
  return blueIcon;
};