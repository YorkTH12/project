import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { blueIcon, greyIcon } from '../utils/mapIcons';

const KMUTNB_COORDS = [13.8197, 100.5146];
const MAX_DISTANCE_KM = 5; 

function MapClickHandler({ onMapClick, markerPosition }) {
  useMapEvents({ click(e) { onMapClick(e.latlng); } });
  return markerPosition ? (
    <Marker position={markerPosition} icon={blueIcon}>
      <Popup>คุณปักหมุดที่นี่</Popup>
    </Marker>
  ) : null;
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; var dLat = deg2rad(lat2 - lat1); var dLon = deg2rad(lon2 - lon1);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); var d = R * c; return d;
}
function deg2rad(deg) { return deg * (Math.PI / 180); }

const ShopRegistrationForm = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState(''); 
  const [operatingHours, setOperatingHours] = useState('');
  const [description, setDescription] = useState('');
  const [markerPosition, setMarkerPosition] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  const fetchAddressFromCoords = async (lat, lng) => {
    setIsGeocoding(true);
    setError('');
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=th`);
      if (!response.ok) throw new Error('Nominatim API call failed');
      const data = await response.json();
      
      if (data && data.display_name) {
        setAddress(data.display_name);
      } else {
        setError("ไม่สามารถค้นหาที่อยู่จากพิกัดนี้ได้");
        setAddress('');
      }
    } catch (err) {
      console.error("Reverse Geocoding Error:", err);
      setError("เกิดข้อผิดพลาดในการค้นหาที่อยู่ (กรุณาลองปักใหม่ หรือกรอกเอง)");
      setAddress('');
    }
    setIsGeocoding(false);
  };

  const handleMapClick = (latlng) => {
    setMarkerPosition(latlng);
    fetchAddressFromCoords(latlng.lat, latlng.lng);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) { setError("คุณต้องล็อกอินก่อน"); return; }
    
    // --- ⬇️ 2. Data Validation เพิ่มความปลอดภัยของข้อมูล ⬇️ ---
    if (!shopName.trim() || !operatingHours.trim() || !address.trim()) {
      setError("กรุณากรอกข้อมูลบังคับให้ครบถ้วน (ห้ามใส่แค่ช่องว่าง)");
      return;
    }
    if (shopName.length > 60) {
      setError("ชื่อร้านยาวเกินไป (ไม่เกิน 60 ตัวอักษร)");
      return;
    }
    // --- ⬆️ จบ Data Validation ⬆️ ---

    if (!markerPosition) { setError("กรุณาปักหมุดตำแหน่งร้านค้า"); return; }
    if (isGeocoding) { setError("กรุณารอการค้นหาที่อยู่ให้เสร็จสิ้นก่อน"); return; }

    const distance = getDistanceFromLatLonInKm(KMUTNB_COORDS[0], KMUTNB_COORDS[1], markerPosition.lat, markerPosition.lng);
    if (distance > MAX_DISTANCE_KM) {
      setError(`ร้านของคุณอยู่ห่างจาก มจพ. ${distance.toFixed(2)} กม. (ไกลเกิน ${MAX_DISTANCE_KM} กม.)`);
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const newShopData = {
        shopName: shopName.trim(), // ตัดช่องว่างส่วนเกินก่อนบันทึก
        address: address.trim(),
        operatingHours: operatingHours.trim(),
        description: description.trim(),
        coordinates: {
          lat: markerPosition.lat,
          lng: markerPosition.lng,
        },
        ownerId: currentUser.uid,
        status: 'pending',
        type: 'shop',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'shops'), newShopData);
      
      alert("ส่งคำขอลงทะเบียนร้านค้าสำเร็จ!");
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
        <h2 className="title">ลงทะเบียนร้านค้า (Shop)</h2>
        <p className="lead">กรอกข้อมูลและปักหมุดร้าน (ต้องอยู่ในระยะ {MAX_DISTANCE_KM} กม. จาก มจพ.)</p>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="shopName">ชื่อร้าน (บังคับ)</label>
            <input id="shopName" type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} required disabled={loading} maxLength={60} />
          </div>
          <div className="form-group">
            <label htmlFor="hours">เวลาเปิด-ปิด (บังคับ)</label>
            <input id="hours" type="text" value={operatingHours} onChange={(e) => setOperatingHours(e.target.value)} required disabled={loading} maxLength={50} />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="address">ที่อยู่ (บังคับ - ระบบจะกรอกให้เมื่อปักหมุด)</label>
            <input 
              id="address" 
              type="text" 
              value={isGeocoding ? 'กำลังค้นหาที่อยู่...' : address}
              onChange={(e) => {
                setIsGeocoding(false);
                setAddress(e.target.value); 
              }} 
              required 
              disabled={loading} 
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="description">คำอธิบายร้านค้า (ไม่บังคับ)</label>
            <textarea id="description" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading} maxLength={200} />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>ตำแหน่งร้านค้า (บังคับ - คลิกปักหมุด)</label>
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

        <button type="submit" className="btn primary fullWidth" disabled={loading || isGeocoding} style={{marginTop: '1rem'}}>
          {loading ? 'กำลังส่งข้อมูล...' : (isGeocoding ? 'กำลังค้นหาที่อยู่...' : 'ส่งคำขอลงทะเบียน')}
        </button>
      </form>
    </div>
  );
};

export default ShopRegistrationForm;