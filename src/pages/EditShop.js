import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import '../styles/global.css';

// 1. Import Map Components
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';

// (พิกัดศูนย์กลางเริ่มต้น)
const defaultCenter = [13.8245, 100.5302];

// (Component ย่อยสำหรับรับการคลิก - เหมือนเดิม)
function MapClickHandler({ onMapClick, markerPosition }) {
  const map = useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });

  // (จำเป็น) เมื่อหน้าแก้ไขโหลด, เราต้องสั่งให้แผนที่ขยับไปที่หมุดเดิม
  useEffect(() => {
    if (markerPosition) {
      map.setView(markerPosition, 16);
    }
  }, [markerPosition, map]);

  return markerPosition ? (
    <Marker position={markerPosition}>
      <Popup>ตำแหน่งที่เลือก</Popup>
    </Marker>
  ) : null;
}

const EditShopPage = () => {
  const { shopId } = useParams();
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  // States สำหรับฟอร์ม
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  
  // --- 2. แก้ไข/เพิ่ม State ---
  const [description, setDescription] = useState(''); // State ใหม่
  const [markerPosition, setMarkerPosition] = useState(null); // State ใหม่
  const [mapCenter, setMapCenter] = useState(defaultCenter); // State สำหรับจุดกลางแผนที่
  // -------------------------

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // (State สำหรับ Reject/Resubmit)
  const [currentStatus, setCurrentStatus] = useState(null);
  const [rejectionReason, setRejectionReason] = useState(null); 

  useEffect(() => {
    // (โค้ดตรวจสอบ currentUser, shopId เหมือนเดิม)
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
        
        // (Security Check: Admin หรือ Owner)
        if (userRole !== 'admin' && shopData.ownerId !== currentUser.uid) {
          setError("คุณไม่มีสิทธิ์แก้ไขร้านค้านี้");
          return; 
        }

        // --- 3. ตั้งค่า State จากข้อมูลที่ดึงมา ---
        setShopName(shopData.shopName);
        setAddress(shopData.address);
        setOperatingHours(shopData.operatingHours);
        setDescription(shopData.description || ''); // (ใช้ || '' กัน error ถ้าไม่มีข้อมูล)
        
        // ตั้งค่าหมุดและจุดกลางแผนที่
        const coords = { lat: shopData.coordinates.lat, lng: shopData.coordinates.lng };
        setMarkerPosition(coords);
        setMapCenter([coords.lat, coords.lng]); // ให้แผนที่เปิดมาที่หมุดเลย
        
        // (ตั้งค่าสถานะ Reject/Resubmit)
        setCurrentStatus(shopData.status);
        if (shopData.status === 'rejected' && shopData.rejectionReason) {
          setRejectionReason(shopData.rejectionReason);
        }
        // -------------------------------------

      } catch (err) {
        console.error("Error fetching doc:", err);
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false); 
      }
    };
    fetchShopData();
  }, [shopId, currentUser, userRole]);

  // ฟังก์ชันสำหรับ Submit การแก้ไข
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // --- 4. ตรวจสอบหมุด ---
    if (!markerPosition) {
      setError("เกิดข้อผิดพลาด: ไม่พบตำแหน่งพิกัด (กรุณาลองคลิกบนแผนที่ใหม่)");
      return;
    }
    // -----------------------

    setLoading(true);
    setError('');

    const updatedData = {
      shopName,
      address,
      operatingHours,
      description: description, // เพิ่มคำอธิบาย
      coordinates: { // ใช้พิกัดจากหมุด
        lat: markerPosition.lat,
        lng: markerPosition.lng,
      },
      updatedAt: serverTimestamp(),
      status: 'pending', // (ส่งตรวจสอบใหม่)
      rejectionReason: "" // (ล้างเหตุผล)
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

  const handleMapClick = (latlng) => {
    setMarkerPosition(latlng); // อัปเดตตำแหน่งหมุดเมื่อคลิก
  };

  // (ส่วน Render Loading / Error เหมือนเดิม)
  if (loading) { /* ... */ }
  if (error) { /* ... */ }

  // (ส่วน Render Form)
  return (
    <div className="card" style={{ maxWidth: 720, margin: '2rem auto 0 auto' }}>
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <h2 className="title">แก้ไขข้อมูลร้านค้า</h2>
        {/* ... (แสดง shopId, ownerId) ... */}
      </div>

      {/* (แสดงกล่องเหตุผล ถ้าถูก Reject - เหมือนเดิม) */}
      {currentStatus === 'rejected' && rejectionReason && (
        <div style={{ /* ... (style ของกล่อง reject) ... */ }}>
          <h3 style={{fontWeight: 600, color: 'white'}}>! ร้านค้าของคุณถูกปฏิเสธ</h3>
          <p><b>เหตุผลจาก Admin:</b> {rejectionReason}</p>
          <p style={{marginTop: '0.5rem', fontSize: '0.9rem'}}>กรุณาแก้ไขข้อมูลให้ถูกต้อง แล้วกด "บันทึก" เพื่อส่งตรวจสอบอีกครั้ง</p>
        </div>
      )}

      {/* (ตัวฟอร์ม) */}
      <form className="form" onSubmit={handleSubmit}>
        {/* ... (ช่อง shopName, hours, address เหมือนเดิม) ... */}
        
        {/* --- 5. เพิ่มช่องคำอธิบาย --- */}
        <div className="form-group">
          <label htmlFor="description">คำอธิบายร้านค้า (ไม่บังคับ)</label>
          <textarea 
            id="description" 
            rows="3" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
          />
        </div>
        {/* ------------------------- */}
        
        {/* --- 6. แสดงแผนที่ --- */}
        <div className="form-group">
          <label>ตำแหน่งร้านค้า (คลิกเพื่อย้ายตำแหน่ง)</label>
          <MapContainer 
            center={mapCenter} 
            zoom={16} 
            style={{ height: '300px', width: '100%', borderRadius: 'var(--radius)', zIndex: 0 }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <MapClickHandler onMapClick={handleMapClick} markerPosition={markerPosition} />
          </MapContainer>
        </div>
        {/* --------------------- */}

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn primary fullWidth" disabled={loading} style={{marginTop: '1rem'}}>
          {loading ? 'กำลังบันทึก...' : 
            (currentStatus === 'rejected' ? 'บันทึกและส่งตรวจสอบใหม่' : 'บันทึกการเปลี่ยนแปลง')
          }
        </button>
      </form>
    </div>
  );
};

export default EditShopPage;