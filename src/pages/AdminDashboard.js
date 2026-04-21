import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
// MODIFIED: เอา updateDoc, serverTimestamp ออกเพราะไม่ได้ใช้ Approve/Reject แล้ว
import { collection, query, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import '../styles/global.css';

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { getIcon } from '../utils/mapIcons';

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

function ResizingMap({ coords, icon }) {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
      map.setView(coords, 16);
    }, 100);
  }, [coords, map]);
  return <Marker position={coords} icon={icon} />;
}

const AdminDashboard = () => {
  const [allShops, setAllShops] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // DELETED: เอา State ของ Reject ออกทั้งหมด
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [currentMapCoords, setCurrentMapCoords] = useState(null);
  const [currentMapType, setCurrentMapType] = useState('shop'); 

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'shops'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const shopsArray = [];
      querySnapshot.forEach((document) => {
        shopsArray.push({ id: document.id, ...document.data() });
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

  // ฟังก์ชัน "ปิด Modal" (เหลือแค่ Map Modal)
  const handleModalClose = () => {
    setIsMapModalOpen(false);
  };
  
  // ฟังก์ชัน "ลบร้านค้า" (ถาวร)
  const handleDeleteShop = async (shopId, shopName) => {
    // ระบบจะขึ้น Popup ถามก่อนลบ
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการ "ลบถาวร" สถานที่ "${shopName}"?\n(การกระทำนี้ลบจากฐานข้อมูลและไม่สามารถกู้คืนได้)`)) {
      try {
        const shopDocRef = doc(db, 'shops', shopId);
        await deleteDoc(shopDocRef); // ลบจาก Firebase
        alert("ลบข้อมูลสำเร็จ");
      } catch (err) {
        console.error("Error deleting document: ", err);
        alert("เกิดข้อผิดพลาดในการลบ");
      }
    }
  };
  
  const handleOpenMap = (coords, type) => {
    setCurrentMapCoords([coords.lat, coords.lng]);
    setCurrentMapType(type || 'shop'); 
    setIsMapModalOpen(true);
  };

  return (
    <>
      {/* Map Modal */}
      {isMapModalOpen && currentMapCoords && (
        <div style={modalOverlayStyle} onClick={handleModalClose}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h2 className="title" style={{marginBottom: 12}}>ตำแหน่งบนแผนที่</h2>
            <MapContainer center={currentMapCoords} zoom={16} style={{ height: '300px', width: '100%', borderRadius: '8px', zIndex: 0 }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <ResizingMap 
                coords={currentMapCoords} 
                icon={getIcon(currentMapType)}
              />
            </MapContainer>
            <button className="btn fullWidth" onClick={handleModalClose} style={{marginTop: 12}}>ปิดแผนที่</button>
          </div>
        </div>
      )}

      {/* หน้ารายการ Admin */}
      <div className="card" style={{ maxWidth: 960, margin: '2rem auto 0 auto' }}>
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <h2 className="title">Admin Dashboard</h2>
          <p className="lead">จัดการสถานที่ทั้งหมดในระบบ (พบ {allShops.length} แห่ง)</p>
        </div>

        {loading && <p>กำลังโหลดข้อมูล...</p>}
        {error && <p className="error-text">{error}</p>}

        <div className="form" style={{ gap: '1rem' }}>
          {allShops.map((shop) => (
            <div 
              key={shop.id} 
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--spacing-md)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius)'
              }}
            >
              <div>
                <h3 style={{ fontWeight: 600, fontSize: '1.1rem' }}>{shop.shopName}</h3>
                
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '6px 0' }}>
                  <span style={{
                    background: shop.type === 'shop' ? 'var(--accent)' : '#E9D5FF', 
                    color: shop.type === 'shop' ? 'white' : '#5B21B6',
                    padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600
                  }}>
                    ประเภท: {shop.type === 'shop' ? 'ร้านรับซื้อ' : (shop.type === 'booth' ? 'ตู้แยกขวด' : 'N/A')}
                  </span>
                </div>
                
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: 0 }}>{shop.address}</p>
                
                <button 
                  onClick={() => handleOpenMap(shop.coordinates, shop.type)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontSize: '0.9rem', 
                    color: 'var(--accent)', 
                    fontWeight: 500,
                    textDecoration: 'underline',
                    marginTop: '8px'
                  }}
                >
                  ดูตำแหน่งบนแผนที่
                </button>
              </div>

              {/* MODIFIED: เหลือแค่ปุ่มแก้ไขและลบถาวร */}
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <Link to={`/edit-shop/${shop.id}`} 
                  className="btn" 
                  style={{ textDecoration:'none', background: '#EDF2F7', color: '#1A202D' }}
                >
                  ✏️ แก้ไข
                </Link>
                
                <button 
                  className="btn"
                  style={{ background: 'var(--danger)', color: 'white' }}
                  onClick={() => handleDeleteShop(shop.id, shop.shopName)}
                >
                  🗑️ ลบถาวร
                </button>
              </div>
            </div>
          ))}

          {/* แจ้งเตือนกรณีไม่มีข้อมูล */}
          {!loading && allShops.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
              ยังไม่มีข้อมูลสถานที่ในระบบ
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;