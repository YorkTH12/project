import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import '../styles/global.css';

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

const ShopList = () => {
  const { currentUser, userRole } = useAuth();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // (State สำหรับ Modal - ถูกต้อง)
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [currentShopId, setCurrentShopId] = useState(null);
  const [archiveReason, setArchiveReason] = useState("");

  // (useEffect - ถูกต้อง)
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return; 
    }
    setLoading(true);
    let q; 

    if (userRole === 'admin') {
      q = query(collection(db, 'shops'));
    } else if (userRole === 'owner') {
      // --- (จุดแก้ไข) ---
      // (Query นี้ถูกต้องแล้ว มันจะดึง "ทุกอย่าง" ที่ Owner เป็นเจ้าของ)
      q = query(
        collection(db, 'shops'), 
        where('ownerId', '==', currentUser.uid),
        where('status', 'in', ['pending', 'approved', 'rejected']) 
      );
      // --- (จบจุดแก้ไข) ---
    } else {
      setError("คุณไม่มีสิทธิ์ดูหน้านี้");
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const shopsArray = [];
      querySnapshot.forEach((doc) => {
        shopsArray.push({ id: doc.id, ...doc.data() }); 
      });
      setShops(shopsArray);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, userRole]);

  // (ฟังก์ชันเปิด Modal - ถูกต้อง)
  const handleArchiveClick = (shopId) => {
    setCurrentShopId(shopId);
    setArchiveReason(""); 
    setIsArchiveModalOpen(true);
  };

  // (ฟังก์ชันปิด Modal - ถูกต้อง)
  const handleModalClose = () => {
    setIsArchiveModalOpen(false);
    setCurrentShopId(null);
  };

  // (ฟังก์ชันยืนยันการซ่อน - ถูกต้อง)
  const handleConfirmArchive = async () => {
    if (!archiveReason) {
      alert("กรุณาใส่เหตุผลที่ต้องการซ่อน/ลบร้านค้า");
      return;
    }
    
    const shopDocRef = doc(db, 'shops', currentShopId);
    try {
      await updateDoc(shopDocRef, {
          status: 'archived', // <-- Soft Delete
          archiveReason: archiveReason, // <-- บันทึกเหตุผล
          updatedAt: serverTimestamp()
      });
      alert("เก็บถาวรร้านค้าสำเร็จ");
      handleModalClose(); // ปิด Modal
    } catch (err) {
      console.error("Error archiving document: ", err);
      alert("เกิดข้อผิดพลาด");
    }
  };
  
  if (loading) {
    return <div className="card" style={{ maxWidth: 960, margin: '2rem auto 0 auto' }}><p>กำลังโหลด...</p></div>;
  }

  if (error) {
    return <div className="card" style={{ maxWidth: 960, margin: '2rem auto 0 auto' }}><p className="error-text">{error}</p></div>;
  }

  // (ส่วน Render)
  return (
    <>
      {/* (Modal JSX - ถูกต้อง) */}
      {isArchiveModalOpen && (
        <div style={modalOverlayStyle} onClick={handleModalClose}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h2 className="title">เหตุผลในการซ่อนร้านค้า</h2>
            <p className="lead" style={{fontSize: '0.9rem'}}>กรุณาระบุสาเหตุ (เช่น ปิดปรับปรุง, เลิกกิจการ) Admin จะใช้ข้อมูลนี้ในการตรวจสอบ</p>
            <div className="form-group" style={{marginTop: '1rem'}}>
              <label htmlFor="reason">เหตุผล (บังคับ):</label>
              <textarea 
                id="reason"
                rows="4"
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                style={{width: '100%'}} 
              />
            </div>
            <div style={{display: 'flex', gap: 12, marginTop: 16}}>
              <button className="btn primary" onClick={handleConfirmArchive} style={{background: 'var(--danger)'}}>
                ยืนยันการซ่อน
              </button>
              <button className="btn" onClick={handleModalClose}>
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* (ส่วนแสดง Card) */}
      <div className="card" style={{ maxWidth: 960, margin: '2rem auto 0 auto' }}>
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <h2 className="title">
            {userRole === 'admin' ? 'จัดการสถานที่ทั้งหมด' : 'สถานที่ของฉัน'}
          </h2>
          <p className="lead">พบ {shops.length} รายการ (ไม่รวมที่เก็บถาวร)</p>
        </div>

        <div className="form" style={{ gap: '1rem' }}>
          {shops.length === 0 && (
            <p>
              {userRole === 'owner' ?
                'คุณยังไม่มีร้านค้าหรือตู้ที่ลงทะเบียนไว้' :
                'ไม่พบข้อมูลในระบบ'}
            </p>
          )}

          {shops.map((shop) => (
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
                {/* (แสดง Type และ Status) */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', margin: '4px 0' }}>
                  <span style={{
                    background: shop.type === 'shop' ? 'var(--accent)' : '#E9D5FF',
                    color: shop.type === 'shop' ? 'white' : '#5B21B6',
                    padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600
                  }}>
                    ประเภท: {shop.type === 'shop' ? 'ร้านค้า' : (shop.type === 'booth' ? 'ตู้' : 'N/A')}
                  </span>
                  <span style={{
                    padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem',
                    background: shop.status === 'approved' ? '#C6F6D5' : (shop.status === 'pending' ? '#FEEBC8' : '#FED7D7'),
                    color: shop.status === 'approved' ? '#22543D' : (shop.status === 'pending' ? '#744210' : '#822727')
                  }}>
                    สถานะ: {shop.status}
                  </span>
                </div>

                {shop.status === 'rejected' && (
                  <p className="error-text" style={{ fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                    <b>เหตุผลที่ถูกปฏิเสธ:</b> {shop.rejectionReason}
                  </p>
                )}
              </div>

              {/* (ส่วนปุ่มจัดการ) */}
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <Link
                  to={`/edit-shop/${shop.id}`}
                  className="btn"
                  style={{ textDecoration: 'none', background: '#EDF2F7', color: '#1A202C' }}
                >
                  {shop.status === 'rejected' ? 'แก้ไขและส่งใหม่' : 'แก้ไข'}
                </Link>

                {/* (ปุ่ม ลบ/ซ่อน - ถูกต้อง) */}
                {userRole === 'owner' && (
                  <button
                    className="btn"
                    style={{ background: 'var(--danger)', color: 'white' }}
                    onClick={() => handleArchiveClick(shop.id)}
                  >
                    ลบ/ซ่อน
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

export default ShopList;