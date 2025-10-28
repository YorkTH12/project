import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';

// 1. Import Map Components จาก React-Leaflet
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';

// 2. พิกัดศูนย์กลาง (วงศ์สว่าง 11)
const mapCenter = [13.8245, 100.5302];

// 3. Component ย่อยสำหรับ "รับการคลิก" บนแผนที่
// (เราต้องสร้าง Component นี้เพื่อใช้ Hook 'useMapEvents')
function MapClickHandler({ onMapClick, markerPosition }) {
  useMapEvents({
    // เมื่อผู้ใช้คลิกที่แผนที่
    click(e) {
      onMapClick(e.latlng); // ส่งค่าพิกัด (latlng) กลับไป
    },
  });

  // ถ้ามี markerPosition, ให้แสดงหมุด
  return markerPosition ? (
    <Marker position={markerPosition}>
      <Popup>คุณปักหมุดที่นี่</Popup>
    </Marker>
  ) : null;
}


const ShopRegistrationForm = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // State สำหรับฟอร์ม
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  
  // --- 4. แก้ไข/เพิ่ม State ---
  // (เราไม่ใช้ state 'lat', 'lng' แล้ว)
  const [markerPosition, setMarkerPosition] = useState(null); // State ใหม่สำหรับเก็บพิกัดที่ปักหมุด
  const [description, setDescription] = useState(''); // State ใหม่สำหรับคำอธิบาย (ไม่บังคับ)
  // -------------------------

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMapClick = (latlng) => {
    setMarkerPosition(latlng); // อัปเดตตำแหน่งหมุดเมื่อคลิก
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError("คุณต้องล็อกอินก่อน");
      return;
    }

    // --- 5. ตรวจสอบว่าปักหมุดหรือยัง ---
    if (!markerPosition) {
      setError("กรุณาคลิกบนแผนที่เพื่อปักหมุดตำแหน่งร้านค้าของคุณ");
      return;
    }
    // ---------------------------------

    setLoading(true);
    setError('');

    try {
      // 6. เตรียมข้อมูลใหม่
      const newShopData = {
        shopName,
        address,
        operatingHours,
        description: description, // เพิ่มคำอธิบาย
        coordinates: {
          lat: markerPosition.lat, // ใช้พิกัดจากหมุด
          lng: markerPosition.lng, // ใช้พิกัดจากหมุด
        },
        ownerId: currentUser.uid,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'shops'), newShopData);
      
      alert("ส่งคำขอลงทะเบียนร้านค้าสำเร็จ! กรุณารอ Admin อนุมัติ");
      navigate('/shop-list'); // (ไปหน้ารายการร้านค้า)

    } catch (err) {
      console.error("Error adding document: ", err);
      setError("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 720, margin: '2rem auto 0 auto' }}>
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <h2 className="title">ลงทะเบียนร้านค้า</h2>
        <p className="lead">กรอกข้อมูลและปักหมุดร้านค้าของคุณ</p>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="shopName">ชื่อร้าน (บังคับ)</label>
            <input id="shopName" type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="hours">เวลาเปิด-ปิด (บังคับ)</label>
            <input id="hours" type="text" value={operatingHours} onChange={(e) => setOperatingHours(e.target.value)} required />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="address">ที่อยู่ (บังคับ)</label>
          <input id="address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />
        </div>
        
        {/* --- 7. เพิ่มช่องคำอธิบาย (ไม่บังคับ) --- */}
        <div className="form-group">
          <label htmlFor="description">คำอธิบายร้านค้า (ไม่บังคับ)</label>
          <textarea 
            id="description" 
            rows="3" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
          />
        </div>
        {/* ------------------------------------- */}

        {/* --- 8. ลบช่อง Lat/Lng และแทนที่ด้วยแผนที่ --- */}
        <div className="form-group">
          <label>ตำแหน่งร้านค้า (บังคับ - คลิกบนแผนที่เพื่อปักหมุด)</label>
          <MapContainer 
            center={mapCenter} 
            zoom={15} 
            style={{ height: '300px', width: '100%', borderRadius: 'var(--radius)', zIndex: 0 }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {/* เรียกใช้ Component ที่รับการคลิก */}
            <MapClickHandler onMapClick={handleMapClick} markerPosition={markerPosition} />
          </MapContainer>
        </div>
        {/* ------------------------------------------- */}

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn primary fullWidth" disabled={loading} style={{marginTop: '1rem'}}>
          {loading ? 'กำลังส่งข้อมูล...' : 'ส่งคำขอลงทะเบียน'}
        </button>
      </form>
    </div>
  );
};

export default ShopRegistrationForm;