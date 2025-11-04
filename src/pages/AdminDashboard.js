import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import '../styles/global.css';

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
// 1. (Import Icons)
import { getIcon } from '../utils/mapIcons';

// (Modal CSS - เหมือนเดิม)
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

// 2. (แก้ไข ResizingMap ให้รับ Icon)
function ResizingMap({ coords, icon }) {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
      map.setView(coords, 16);
    }, 100);
  }, [coords, map]);
  // (ใช้ Icon ที่ส่งเข้ามา)
  return <Marker position={coords} icon={icon} />;
}

// --- Component หลัก ---
const AdminDashboard = () => {
  // (States - เหมือนเดิม)
  const [allShops, setAllShops] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [currentShopId, setCurrentShopId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [currentMapCoords, setCurrentMapCoords] = useState(null);
  
  // --- 3. (เพิ่ม State) ---
  const [currentMapType, setCurrentMapType] = useState('shop'); // (เก็บ Type ของร้านที่จะดู)
  // -------------------------

  // (useEffect ดึง allShops - เหมือนเดิม)
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

  
  // (ฟังก์ชันการทำงานของปุ่ม - handleApprove, handleRejectClick, etc. - เหมือนเดิม)
  
  // ฟังก์ชัน "อนุมัติ"
  const handleApprove = async (shopId) => {
    const shopDocRef = doc(db, 'shops', shopId);
    try {
      await updateDoc(shopDocRef, {
        status: 'approved',
        rejectionReason: "", 
        updatedAt: serverTimestamp(),
      });
      alert(`อนุมัติร้านค้า ${shopId} เรียบร้อย`);
    } catch (err) {
      console.error("Error approving shop: ", err);
      alert("เกิดข้อผิดพลาดในการอนุมัติ");
    }
  };

  // ฟังก์ชัน "กดปุ่มปฏิเสธ" (เปิด Modal)
  const handleRejectClick = (shopId) => {
    setCurrentShopId(shopId);
    setRejectionReason("");
    setIsRejectModalOpen(true);
  };

  // ฟังก์ชัน "ปิด Modal" (ใช้ทั้ง 2 Modal)
  const handleModalClose = () => {
    setIsRejectModalOpen(false);
    setIsMapModalOpen(false);
    setCurrentShopId(null);
  };
  
  // ฟังก์ชัน "ลบร้านค้า" (ถาวร)
  const handleDeleteShop = async (shopId, shopName) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการ "ลบถาวร" ร้าน "${shopName}"?\n(การกระทำนี้ไม่สามารถกู้คืนได้)`)) {
      try {
        const shopDocRef = doc(db, 'shops', shopId);
        await deleteDoc(shopDocRef); 
        alert("ลบร้านค้าสำเร็จ");
      } catch (err) {
        console.error("Error deleting document: ", err);
        alert("เกิดข้อผิดพลาดในการลบ");
      }
    }
  };

  // ฟังก์ชัน "ยืนยันการปฏิเสธ" (ใน Modal)
  const handleConfirmReject = async () => {
    if (!rejectionReason) {
      alert("กรุณาใส่เหตุผลที่ปฏิเสธ");
      return;
    }

    const shopDocRef = doc(db, 'shops', currentShopId);
    try {
      await updateDoc(shopDocRef, {
        status: 'rejected',
        rejectionReason: rejectionReason, 
        updatedAt: serverTimestamp(),
      });
      alert(`ปฏิเสธร้านค้า ${currentShopId} เรียบร้อย`);
      handleModalClose(); 
    } catch (err) {
      console.error("Error rejecting document: ", err);
      alert("เกิดข้อผิดพลาดในการปฏิเสธ");
    }
  };
  
  // --- 4. (แก้ไข handleOpenMap) ---
  const handleOpenMap = (coords, type) => {
    setCurrentMapCoords([coords.lat, coords.lng]);
    setCurrentMapType(type || 'shop'); // (รับ type มาเก็บ)
    setIsMapModalOpen(true);
  };
  // -------------------

  return (
    <>
      {/* 5. (Map Modal - แก้ไข) */}
      {isMapModalOpen && currentMapCoords && (
        <div style={modalOverlayStyle} onClick={handleModalClose}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h2 className="title" style={{marginBottom: 12}}>ตำแหน่งร้านค้า</h2>
            <MapContainer center={currentMapCoords} zoom={16} style={{ height: '300px', width: '100%', borderRadius: '8px' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {/* (ส่ง Icon ที่ถูกต้องเข้าไป) */}
              <ResizingMap 
                coords={currentMapCoords} 
                icon={getIcon(currentMapType)} // <-- ⭐️ แก้ไขตรงนี้
              />
            </MapContainer>
            <button className="btn" onClick={handleModalClose} style={{marginTop: 12}}>ปิด</button>
          </div>
        </div>
      )}

      {/* (Reject Modal - เหมือนเดิม) */}
      {isRejectModalOpen && (
        <div style={modalOverlayStyle} onClick={handleModalClose}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h2 className="title">เหตุผลที่ปฏิเสธ</h2>
            <p className="lead" style={{fontSize: '0.9rem'}}>กรุณาระบุสาเหตุที่ปฏิเสธร้านค้า (ID: {currentShopId})</p>
            <div className="form-group" style={{marginTop: '1rem'}}>
              <label htmlFor="reason">เหตุผล:</label>
              <textarea 
                id="reason"
                rows="4"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                style={{width: '100%'}} 
              />
            </div>
            <div style={{display: 'flex', gap: 12, marginTop: 16}}>
              <button className="btn primary" onClick={handleConfirmReject} style={{background: 'var(--danger)'}}>
                ยืนยันการปฏิเสธ
              </button>
              <button className="btn" onClick={handleModalClose}>
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* (หน้ารายการ Admin) */}
      <div className="card" style={{ maxWidth: 960, margin: '2rem auto 0 auto' }}>
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <h2 className="title">Admin Dashboard (จัดการทุกสถานที่)</h2>
          <p className="lead">พบสถานที่ทั้งหมด {allShops.length} แห่งในระบบ</p>
        </div>

        {loading && <p>กำลังโหลด...</p>}
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
                <h3 style={{ fontWeight: 600 }}>{shop.shopName}</h3>
                
                {/* (แสดง Type และ Status - เหมือนเดิม) */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', margin: '4px 0' }}>
                  <span style={{
                    background: shop.type === 'shop' ? 'var(--accent)' : '#E9D5FF', 
                    color: shop.type === 'shop' ? 'white' : '#5B21B6',
                    padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600
                  }}>
                    ประเภท: {shop.type === 'shop' ? 'ร้านค้า' : (shop.type === 'booth' ? 'ตู้' : 'N/A')}
                  </span>
                  <span style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    background: shop.status === 'approved' ? '#C6F6D5' : (shop.status === 'pending' ? '#FEEBC8' : (shop.status === 'rejected' ? '#FED7D7' : '#E2E8F0')),
                    color: shop.status === 'approved' ? '#22543D' : (shop.status === 'pending' ? '#744210' : (shop.status === 'rejected' ? '#822727' : '#4A5568')),
                  }}>
                    สถานะ: {shop.status}
                  </span>
                </div>
                
                <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: 0 }}>{shop.address}</p>
                
                {/* 6. (ปุ่มดูแผนที่ - แก้ไข) */}
                <button 
                  onClick={() => handleOpenMap(shop.coordinates, shop.type)} // <-- ⭐️ แก้ไขตรงนี้
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
                
                {/* (แสดงเหตุผล Reject/Archived - เหมือนเดิม) */}
                {shop.status === 'rejected' && (
                  <p className="error-text" style={{fontSize: '0.8rem', margin: '4px 0 0 0'}}>
                    เหตุผล (Reject): {shop.rejectionReason}
                  </p>
                )}
                {shop.status === 'archived' && (
                  <p style={{fontSize: '0.8rem', margin: '4px 0 0 0', color: 'var(--muted)', fontWeight: 500, fontStyle: 'italic'}}>
                    เหตุผล (ซ่อนโดย Owner): {shop.archiveReason}
                  </p>
                )}
              </div>

              {/* (ส่วนปุ่มจัดการ - เหมือนเดิม) */}
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <Link to={`/edit-shop/${shop.id}`} 
                  className="btn" 
                  style={{ textDecoration:'none', background: '#EDF2F7', color: '#1A202D' }}
                >
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
                <button 
                  className="btn"
                  style={{ background: '#2D3748', color: 'white' }}
                  onClick={() => handleDeleteShop(shop.id, shop.shopName)}
                >
                  ลบถาวร
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;