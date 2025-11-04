// src/pages/BoothRegistrationForm.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
// 1. (Import Icons - ใช้สีเขียว)
import { greenIcon, greyIcon } from '../utils/mapIcons';

// (Geofencing settings)
const KMUTNB_COORDS = [13.8197, 100.5146];
const MAX_DISTANCE_KM = 5; 

// 2. (แก้ไข MapClickHandler ให้ใช้ Icon สีเขียว)
function MapClickHandler({ onMapClick, markerPosition }) {
  useMapEvents({ click(e) { onMapClick(e.latlng); } });
  
  return markerPosition ? (
    <Marker position={markerPosition} icon={greenIcon}>
      <Popup>คุณปักหมุดตู้ที่นี่</Popup>
    </Marker>
  ) : null;
}

// (Haversine functions)
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; var dLat = deg2rad(lat2 - lat1); var dLon = deg2rad(lon2 - lon1);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); var d = R * c; return d;
}
function deg2rad(deg) { return deg * (Math.PI / 180); }
// ---------------------------------

const BoothRegistrationForm = () => { // (เปลี่ยนชื่อ Component)
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // (States ฟอร์ม)
  const [shopName, setShopName] = useState(''); // (หมายถึง "ชื่อตู้")
  const [address, setAddress] = useState('');
  const [operatingHours, setOperatingHours] = useState('เปิด 24 ชั่วโมง'); // (ค่าเริ่มต้น)
  const [description, setDescription] = useState('');
  const [markerPosition, setMarkerPosition] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMapClick = (latlng) => { setMarkerPosition(latlng); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) { setError("คุณต้องล็อกอินก่อน"); return; }
    if (!markerPosition) { setError("กรุณาปักหมุดตำแหน่งตู้"); return; }

    const distance = getDistanceFromLatLonInKm(KMUTNB_COORDS[0], KMUTNB_COORDS[1], markerPosition.lat, markerPosition.lng);
    if (distance > MAX_DISTANCE_KM) {
      setError(`ตู้ของคุณอยู่ห่างจาก มจพ. ${distance.toFixed(2)} กม. (ไกลเกิน ${MAX_DISTANCE_KM} กม.)`);
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // --- 3. (จุดแก้ไขหลัก) ---
      const newBoothData = {
        shopName,
        address,
        operatingHours,
        description,
        coordinates: {
          lat: markerPosition.lat,
          lng: markerPosition.lng,
        },
        ownerId: currentUser.uid,
        status: 'pending',
        type: 'booth', // <-- ⭐️ เปลี่ยน Type เป็น 'booth'
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // (ไม่มี proofImageUrl และ boothStatus)
      };

      await addDoc(collection(db, 'shops'), newBoothData); // (ยังใช้ collection 'shops')
      
      alert("ส่งคำขอลงทะเบียนตู้สำเร็จ!");
      navigate('/shop-list');

    } catch (err) {
      console.error("Error adding document: ", err);
      setError("เกิดข้อผิดพลาดในการบันทึก: " + err.message);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="card" style={{ maxWidth: 720, margin: '2rem auto 0 auto' }}>
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <h2 className="title">ลงทะเบียนตู้แยกขวด (Booth)</h2>
        <p className="lead">กรอกข้อมูลและปักหมุดตู้ (ต้องอยู่ในระยะ {MAX_DISTANCE_KM} กม. จาก มจพ.)</p>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="shopName">ชื่อตู้ / สถานที่ตั้ง (บังคับ)</label>
            <input id="shopName" type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} required disabled={loading} />
          </div>
          <div className="form-group">
            <label htmlFor="hours">เวลาทำการ (บังคับ)</label>
            <input id="hours" type="text" value={operatingHours} onChange={(e) => setOperatingHours(e.target.value)} required disabled={loading} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="address">ที่อยู่/คำอธิบายที่ตั้ง (บังคับ)</label>
            <input id="address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} required disabled={loading} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="description">คำอธิบายเพิ่มเติม (ไม่บังคับ)</label>
            <textarea id="description" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading} />
          </div>
        </div>
        
        {/* (แผนที่ - ใช้ greyIcon สำหรับ มจพ.) */}
        <div className="form-row">
          <div className="form-group">
            <label>ตำแหน่งตู้ (บังคับ - คลิกปักหมุด)</label>
            <MapContainer center={KMUTNB_COORDS} zoom={13} style={{ height: '300px', width: '100%', borderRadius: 'var(--radius)', zIndex: 0 }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapClickHandler onMapClick={handleMapClick} markerPosition={markerPosition} />
              <Marker position={KMUTNB_COORDS} icon={greyIcon}>
                <Popup>มจพ. (จุดศูนย์กลาง)</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn primary fullWidth" disabled={loading} style={{marginTop: '1rem'}}>
          {loading ? 'กำลังส่งข้อมูล...' : 'ส่งคำขอลงทะเบียนตู้'}
        </button>
      </form>
    </div>
  );
};

export default BoothRegistrationForm;