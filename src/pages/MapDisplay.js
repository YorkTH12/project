// src/pages/MapDisplay.js (เวอร์ชัน React-Leaflet)
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

// L.Icon = require('leaflet/dist/images/marker-icon.png'); // (แก้ปัญหา Marker Icon หาย)
// (ถ้าไอคอนหมุดไม่ขึ้น ให้ลอง import รูปไอคอนเอง)

// พิกัดศูนย์กลาง (วงศ์สว่าง 11)
const center = [13.827012, 100.520454];

function MapDisplay() {
  const [shops, setShops] = useState([]);

  useEffect(() => {
    // 1. Query ร้านที่ 'approved' (เหมือนเดิม)
    const q = query(
      collection(db, 'shops'), 
      where('status', '==', 'approved')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const approvedShops = [];
      querySnapshot.forEach((doc) => {
        approvedShops.push({ id: doc.id, ...doc.data() });
      });
      setShops(approvedShops);
    });

    return () => unsubscribe();
  }, []);

  return (
    // 2. สร้างแผนที่ด้วย <MapContainer>
    <MapContainer 
      center={center} 
      zoom={15} 
      style={{ height: '80vh', width: '100%' }} // ต้องกำหนดความสูง/กว้าง
    >
      {/* 3. นี่คือ "ลายแผนที่" ที่ดึงมาจาก OpenStreetMap (ฟรี!) */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* 4. วน Loop แสดง Marker (หมุด) */}
      {shops.map((shop) => (
        <Marker 
          key={shop.id} 
          // Leaflet ใช้ [lat, lng] (สลับกับ Google ที่ใช้ {lat, lng})
          position={[shop.coordinates.lat, shop.coordinates.lng]} 
        >
          {/* 5. Popup เมื่อคลิกที่หมุด */}
          <Popup>
            <b>{shop.shopName}</b> <br />
            เวลาทำการ: {shop.operatingHours}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapDisplay;