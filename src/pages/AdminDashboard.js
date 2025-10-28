import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import '../styles/global.css';

// 1. Import React-Leaflet
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
// (อย่าลืม import 'leaflet/dist/leaflet.css' ใน index.js หรือ App.js)

// --- (CSS สำหรับ Modal) ---
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  background: 'white',
  padding: '20px',
  borderRadius: '8px',
  width: '90%',
  maxWidth: '500px',
  zIndex: 1001,
};
// --- (จบส่วน Modal CSS) ---

// 2. Sub-Component สำหรับแก้บั๊ก Leaflet ใน Modal
// (Leaflet จะคำนวณขนาดผิดถ้าถูกซ่อนตอนโหลด)
function ResizingMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    // หน่วงเวลาเล็กน้อย (100ms) เพื่อให้ Modal แสดงผลเสร็จ
    // แล้วค่อยสั่งให้แผนที่ "วาดตัวเองใหม่"
    setTimeout(() => {
      map.invalidateSize();
      map.setView(coords, 16); // ตั้งค่าจุดกลางใหม่
    }, 100);
  }, [coords, map]);

  return <Marker position={coords} />;
}

// --- Component หลัก ---
const AdminDashboard = () => {
  const [allShops, setAllShops] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State สำหรับ Modal (Reject)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [currentShopId, setCurrentShopId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // 3. State ใหม่สำหรับ Modal (Map)
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [currentMapCoords, setCurrentMapCoords] = useState(null);

  // (useEffect ดึงข้อมูล allShops เหมือนเดิม)
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'shops'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const shopsArray = [];
      querySnapshot.forEach((doc) => {
        shopsArray.push({ id: doc.id, ...doc.data() });
      });
      setAllShops(shopsArray);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setError("คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้");
      setLoading(false);
    });
    return () => unsubscribe();
  }, []); 

  // (ฟังก์ชัน Reject Modal ทั้งหมด ...handleApprove, handleRejectClick, etc. ... เหมือนเดิม)
  const handleApprove = async (shopId) => {
    // ... (เหมือนเดิม) ...
  };
  const handleRejectClick = (shopId) => {
    setCurrentShopId(shopId);
    setRejectionReason("");
    setIsRejectModalOpen(true);
  };
  const handleModalClose = () => {
    setIsRejectModalOpen(false);
    setCurrentShopId(null);
  };
  const handleConfirmReject = async () => {
    // ... (เหมือนเดิม) ...
  };

  // 4. ฟังก์ชันใหม่สำหรับเปิด/ปิด Map Modal
  const handleOpenMap = (coords) => {
    setCurrentMapCoords([coords.lat, coords.lng]); // Leaflet ใช้ Array [lat, lng]
    setIsMapModalOpen(true);
  };
  const handleCloseMap = () => {
    setIsMapModalOpen(false);
    setCurrentMapCoords(null);
  };

  return (
    <> {/* (ใช้ Fragment หุ้ม) */}
      
      {/* --- 5. Map Modal --- */}
      {isMapModalOpen && currentMapCoords && (
        <div style={modalOverlayStyle} onClick={handleCloseMap}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h2 className="title" style={{marginBottom: 12}}>ตำแหน่งร้านค้า</h2>
            <MapContainer
              center={currentMapCoords}
              zoom={16}
              style={{ height: '300px', width: '100%', borderRadius: '8px' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {/* ใช้ Sub-component เพื่อ resize */}
              <ResizingMap coords={currentMapCoords} />
            </MapContainer>
            <button className="btn" onClick={handleCloseMap} style={{marginTop: 12}}>
              ปิด
            </button>
          </div>
        </div>
      )}

      {/* --- Reject Modal (เหมือนเดิม) --- */}
      {isRejectModalOpen && (
        <div style={modalOverlayStyle} onClick={handleModalClose}>
          {/* ... (โค้ด Modal ของ Reject เหมือนเดิม) ... */}
        </div>
      )}

      {/* --- หน้ารายการ Admin (เหมือนเดิม) --- */}
      <div className="card" style={{ maxWidth: 960, margin: '2rem auto 0 auto' }}>
        {/* ... (ส่วน Title/Lead) ... */}

        {loading && <p>กำลังโหลด...</p>}
        {error && <p className="error-text">{error}</p>}

        <div className="form" style={{ gap: '1rem' }}>
          {allShops.map((shop) => (
            <div 
              key={shop.id} 
              // ... (style เหมือนเดิม) ...
            >
              <div>
                <h3 style={{ fontWeight: 600 }}>{shop.shopName}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>{shop.address}</p>
                
                {/* 6. เปลี่ยนจาก <a> เป็น <button> */}
                <button 
                  onClick={() => handleOpenMap(shop.coordinates)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontSize: '0.9rem', 
                    color: 'var(--accent)', 
                    fontWeight: 500,
                    textDecoration: 'underline'
                  }}
                >
                  ดูตำแหน่งบนแผนที่
                </button>

                {/* (แสดงสถานะเหมือนเดิม) */}
                <span style={{ fontSize: '0.9rem', color: 'var(--muted)', marginLeft: '1rem' }}>
                  สถานะ: {shop.status}
                </span>
                
                {/* (แสดงเหตุผล Reject เหมือนเดิม) */}
                {shop.status === 'rejected' && (
                  <p className="error-text" style={{fontSize: '0.8rem', margin: 0}}>
                    เหตุผล: {shop.rejectionReason}
                  </p>
                )}
              </div>

              {/* (ส่วนปุ่มจัดการ เหมือนเดิม) */}
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <Link to={`/edit-shop/${shop.id}`} /* ... */ >
                  แก้ไข
                </Link>
                
                {shop.status !== 'approved' && (
                  <button className="btn primary" onClick={() => handleApprove(shop.id)}>
                    อนุมัติ
                  </button>
                )}
                
                {shop.status !== 'rejected' && (
                  <button 
                    className="btn"
                    style={{ background: 'var(--danger)', color: 'white' }}
                    onClick={() => handleRejectClick(shop.id)}
                  >
                    ปฏิเสธ
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;