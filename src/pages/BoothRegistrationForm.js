import React, { useState, useRef, useEffect } from 'react'; // ADDED
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../styles/global.css';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { greenIcon, greyIcon } from '../utils/mapIcons';

const KMUTNB_COORDS = [13.8197, 100.5146];
const MAX_DISTANCE_KM = 5; 

function MapClickHandler({ onMapClick, markerPosition }) {
  useMapEvents({ click(e) { onMapClick(e.latlng); } });
  return markerPosition ? (
    <Marker position={markerPosition} icon={greenIcon}>
      <Popup>คุณปักหมุดตู้ที่นี่</Popup>
    </Marker>
  ) : null;
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) { //Haversine Formula
  var R = 6371; var dLat = deg2rad(lat2 - lat1); var dLon = deg2rad(lon2 - lon1);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); var d = R * c; return d;
}
function deg2rad(deg) { return deg * (Math.PI / 180); }

const BoothRegistrationForm = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [shopName, setShopName] = useState(''); 
  const [address, setAddress] = useState(''); 
  const [operatingHours, setOperatingHours] = useState('เปิด 24 ชั่วโมง');
  const [description, setDescription] = useState('');
  const [markerPosition, setMarkerPosition] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  // ADDED: ใช้ useRef เพื่อเก็บ Timeout
  const debounceTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const fetchAddressFromCoords = async (lat, lng) => {
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
    setIsGeocoding(true);
    setAddress('กำลังดึงข้อมูลที่อยู่...');
    setError('');

    // MODIFIED: เทคนิค Debounce กันรัวปุ่ม
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchAddressFromCoords(latlng.lat, latlng.lng);
    }, 1000); // ดีเลย์ 1 วิ
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) { setError("คุณต้องล็อกอินก่อน"); return; }
    if (!markerPosition) { setError("กรุณาปักหมุดตำแหน่งตู้"); return; }
    if (isGeocoding) { setError("กรุณารอการค้นหาที่อยู่ให้เสร็จสิ้นก่อน"); return; }

    const distance = getDistanceFromLatLonInKm(KMUTNB_COORDS[0], KMUTNB_COORDS[1], markerPosition.lat, markerPosition.lng);
    if (distance > MAX_DISTANCE_KM) {
      setError(`ตู้ของคุณอยู่ห่างจาก มจพ. ${distance.toFixed(2)} กม. (ไกลเกิน ${MAX_DISTANCE_KM} กม.)`);
      return;
    }
    
    setLoading(true);
    setError('');

    try {
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
        status: 'approved', 
        type: 'booth', 
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'shops'), newBoothData);
      
      alert("ลงทะเบียนตู้สำเร็จและแสดงบนแผนที่แล้ว!");
      navigate('/');

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
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
              {['เปิด 24 ชั่วโมง', '06:00 - 22:00', '08:00 - 20:00', 'ตามเวลาเปิดห้าง'].map(time => (
                <button 
                  key={time} type="button" onClick={() => setOperatingHours(time)} disabled={loading}
                  style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg)', color: 'var(--muted)', cursor: 'pointer' }}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="address">ที่อยู่/คำอธิบายที่ตั้ง (บังคับ)</label>
            <input 
              id="address" 
              type="text" 
              value={address} 
              onChange={(e) => {
                setIsGeocoding(false); 
                setAddress(e.target.value); 
              }} 
              required 
              disabled={loading || isGeocoding} 
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="description">คำอธิบายเพิ่มเติม (ไม่บังคับ)</label>
            <textarea id="description" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} disabled={loading} />
          </div>
        </div>
        
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

        <button type="submit" className="btn primary fullWidth" disabled={loading || isGeocoding} style={{marginTop: '1rem'}}>
          {loading ? 'กำลังบันทึกข้อมูล...' : (isGeocoding ? 'กำลังค้นหาที่อยู่...' : 'ลงทะเบียนตู้')}
        </button>
      </form>
    </div>
  );
};

export default BoothRegistrationForm;