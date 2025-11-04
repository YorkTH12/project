import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import '../styles/global.css';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { getIcon } from '../utils/mapIcons';

// (พิกัดศูนย์กลางเริ่มต้น)
const defaultCenter = [13.8245, 100.5302];

// (Component ย่อยสำหรับรับการคลิก)
function MapClickHandler({ onMapClick, markerPosition, icon }) {
  const map = useMapEvents({
     click(e) { onMapClick(e.latlng); },
  });
  useEffect(() => {
    if (markerPosition) {
      map.setView(markerPosition, 16);
    }
  }, [markerPosition, map]);

  return markerPosition ? (
    <Marker position={markerPosition} icon={icon}>
      <Popup>ตำแหน่งที่เลือก</Popup>
    </Marker>
  ) : null;
}

const EditShopPage = () => {
  const { shopId } = useParams();
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  // (States ฟอร์ม)
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [description, setDescription] = useState('');
  const [markerPosition, setMarkerPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  // (States Logic)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStatus, setCurrentStatus] = useState(null);
  const [rejectionReason, setRejectionReason] = useState(null); 
  const [originalOwnerId, setOriginalOwnerId] = useState(null);
  const [currentType, setCurrentType] = useState('shop'); 
  
  // --- 1. (เพิ่ม State) ---
  const [isGeocoding, setIsGeocoding] = useState(false);
  // -------------------------

  // (useEffect - ดึงข้อมูล - เหมือนเดิม)
  useEffect(() => {
    if (!currentUser || !shopId) {
      setLoading(false);
      setError("ไม่พบข้อมูลผู้ใช้หรือร้านค้า");
      return;
    }

    const fetchShopData = async () => {
      const shopDocRef = doc(db, 'shops', shopId);
      try {
        const docSnap = await getDoc(shopDocRef);
        if (!docSnap.exists()) {
          setError("ไม่พบร้านค้านี้");
          return;
        }
        const shopData = docSnap.data();
        if (userRole !== 'admin' && shopData.ownerId !== currentUser.uid) {
          setError("คุณไม่มีสิทธิ์แก้ไขร้านค้านี้");
          return; 
        }
        
        setShopName(shopData.shopName);
        setAddress(shopData.address);
        setOperatingHours(shopData.operatingHours);
        setDescription(shopData.description || '');
        const coords = { lat: shopData.coordinates.lat, lng: shopData.coordinates.lng };
        setMarkerPosition(coords);
        setMapCenter([coords.lat, coords.lng]);
        setCurrentStatus(shopData.status);
        setOriginalOwnerId(shopData.ownerId);
        setCurrentType(shopData.type || 'shop'); 
        
        if (shopData.status === 'rejected' && shopData.rejectionReason) {
          setRejectionReason(shopData.rejectionReason);
        }
      } catch (err) {
        console.error("Error fetching doc:", err);
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false); 
      }
    };
    fetchShopData();
  }, [shopId, currentUser, userRole]);

  // --- 2. (ฟังก์ชันใหม่) ---
  const fetchAddressFromCoords = async (lat, lng) => {
    setIsGeocoding(true);
    setError('');
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=th`);
      if (!response.ok) throw new Error('Nominatim API call failed');
      const data = await response.json();
      
      if (data && data.display_name) {
        setAddress(data.display_name); // ⭐️ (กรอกที่อยู่ให้อัตโนมัติ)
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
  // -------------------------

  // (handleSubmit - เหมือนเดิม)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!markerPosition) {
      setError("เกิดข้อผิดพลาด: ไม่พบตำแหน่งพิกัด");
      return;
    }
    if (isGeocoding) { setError("กรุณารอการค้นหาที่อยู่ให้เสร็จสิ้นก่อน"); return; }
    
    setLoading(true);
    setError('');
    const updatedData = {
      shopName,
      address,
      operatingHours,
      description: description,
      coordinates: {
        lat: markerPosition.lat,
        lng: markerPosition.lng,
      },
      updatedAt: serverTimestamp(),
      status: 'pending',
      rejectionReason: ""
    };
    try {
      const shopDocRef = doc(db, 'shops', shopId);
      await updateDoc(shopDocRef, updatedData);
      alert("บันทึกการแก้ไข และส่งข้อมูลเพื่อรอการตรวจสอบใหม่แล้ว");
      navigate(userRole === 'admin' ? '/admin' : '/shop-list');
    } catch (err) {
      console.error("Error updating document:", err);
      setError("เกิดข้อผิดพลาดในการอัปเดต: " + err.message);
    }
    setLoading(false);
  };

  // --- 3. (แก้ไข) ---
  const handleMapClick = (latlng) => {
    setMarkerPosition(latlng); // 1. ปักหมุด
    fetchAddressFromCoords(latlng.lat, latlng.lng); // 2. ค้นหาที่อยู่
  };
  // -------------------

  if (loading) {
    return <div className="card" style={{ maxWidth: 720, margin: '2rem auto 0 auto', textAlign: 'center' }}><p>กำลังโหลด...</p></div>;
  }
  if (error) {
    return <div className="card" style={{ maxWidth: 720, margin: '2rem auto 0 auto', textAlign: 'center' }}><p className="error-text">{error}</p></div>;
  }

  return (
    <div className="card" style={{ maxWidth: 720, margin: '2rem auto 0 auto' }}>
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <h2 className="title">แก้ไขข้อมูลสถานที่</h2>
        <p className="lead" style={{fontSize: '0.9rem', overflowWrap: 'break-word'}}>Shop ID: {shopId}</p>
        {userRole === 'admin' && <p className="lead" style={{fontSize: '0.9rem'}}>เจ้าของ: {originalOwnerId}</p>}
      </div>

      {/* (กล่อง Reject) */}
      {currentStatus === 'rejected' && rejectionReason && (
        <div style={{ 
            padding: 'var(--spacing-md)',
            background: 'var(--danger)',
            color: 'white',
            borderRadius: 'var(--radius)',
            marginBottom: 'var(--spacing-md)'
         }}>
          <h3 style={{fontWeight: 600, color: 'white'}}>! สถานที่นี้ถูกปฏิเสธ</h3>
          <p><b>เหตุผลจาก Admin:</b> {rejectionReason}</p>
          <p style={{marginTop: '0.5rem', fontSize: '0.9rem'}}>กรุณาแก้ไขข้อมูลให้ถูกต้อง แล้วกด "บันทึก" เพื่อส่งตรวจสอบอีกครั้ง</p>
        </div>
      )}

<form className="form" onSubmit={handleSubmit}>
    <div className="form-row">
        <div className="form-group">
            <label htmlFor='shopName'>ชื่อสถานที่ (ร้าน/ตู้)</label>
            <input
                id='shopName'
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
            />
        </div>
        <div className="form-group">
            <label htmlFor='hours'>เวลาเปิด-ปิด</label>
            <input
                id='hours'
                type="text"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                placeholder="เช่น 10:00 - 22:00"
            />
        </div>
    </div>

    {/* --- 4. (แก้ไข Input ที่อยู่) --- */}
    <div className="form-row">
        <div className="form-group">
            <label htmlFor='address'>ที่อยู่ (ระบบจะกรอกให้เมื่อปักหมุด)</label>
            <input
                id='address'
                type="text"
                value={isGeocoding ? 'กำลังค้นหาที่อยู่...' : address} // (แสดงสถานะ)
                onChange={(e) => {
                  setIsGeocoding(false); 
                  setAddress(e.target.value); 
                }}
                required
            />
        </div>
    </div>
    {/* --------------------------- */}

    <div className="form-row">
        <div className="form-group">
            <label htmlFor='description'>คำอธิบาย</label>
            <textarea
                id='description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
            />
        </div>
    </div>

    <div className="form-row">
        <div className="form-group">
            <label>ตำแหน่ง (คลิกเพื่อย้ายตำแหน่ง)</label>
            <MapContainer center={mapCenter} zoom={markerPosition ? 16 : 13} style={{ height: 300, width: '100%', borderRadius: 'var(--radius)', zIndex: 0 }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />
                <MapClickHandler 
                  onMapClick={handleMapClick} 
                  markerPosition={markerPosition} 
                  icon={getIcon(currentType)} // (ใช้ Icon ตาม Type)
                />
            </MapContainer>
        </div>
    </div>

    {error && <p className="error-text">{error}</p>}

    <button type="submit" className="btn primary fullWidth" disabled={loading || isGeocoding} style={{marginTop: '1rem'}}>
        {loading ? 'กำลังบันทึก...' : (isGeocoding ? 'กำลังค้นหาที่อยู่...' : (currentStatus === 'rejected' ? 'บันทึกและส่งตรวจสอบใหม่' : 'บันทึกการเปลี่ยนแปลง'))}
    </button>
</form>
    </div>
  );
};

export default EditShopPage;