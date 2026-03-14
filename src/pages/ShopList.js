import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import '../styles/global.css';

// ⭐️ Import Component ที่เราแตกไฟล์ไว้ ⭐️
import ShopCard from '../components/ShopCard';

const modalOverlayStyle = { /* ... คงไว้เหมือนเดิม ... */ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, };
const modalContentStyle = { /* ... คงไว้เหมือนเดิม ... */ background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '500px', zIndex: 1001, };

const ShopList = () => {
  const { currentUser, userRole } = useAuth();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState("");

  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [currentShopId, setCurrentShopId] = useState(null);
  const [archiveReason, setArchiveReason] = useState("");

  useEffect(() => {
    if (!currentUser) { setLoading(false); return; }
    setLoading(true);
    let q; 

    if (userRole === 'admin') {
      q = query(collection(db, 'shops'));
    } else if (userRole === 'owner') {
      q = query(collection(db, 'shops'), where('ownerId', '==', currentUser.uid), where('status', 'in', ['pending', 'approved', 'rejected']));
    } else {
      setError("คุณไม่มีสิทธิ์ดูหน้านี้"); setLoading(false); return;
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const shopsArray = [];
      querySnapshot.forEach((doc) => { shopsArray.push({ id: doc.id, ...doc.data() }); });
      setShops(shopsArray); setLoading(false);
    }, (err) => {
      console.error(err); setError("เกิดข้อผิดพลาดในการดึงข้อมูล"); setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, userRole]);

  const handleArchiveClick = (shopId) => { setCurrentShopId(shopId); setArchiveReason(""); setIsArchiveModalOpen(true); };
  const handleModalClose = () => { setIsArchiveModalOpen(false); setCurrentShopId(null); };

  const handleConfirmArchive = async () => {
    if (!archiveReason) { alert("กรุณาใส่เหตุผลที่ต้องการซ่อน/ลบร้านค้า"); return; }
    const shopDocRef = doc(db, 'shops', currentShopId);
    try {
      await updateDoc(shopDocRef, { status: 'archived', archiveReason: archiveReason, updatedAt: serverTimestamp() });
      alert("เก็บถาวรร้านค้าสำเร็จ"); handleModalClose(); 
    } catch (err) {
      console.error("Error:", err); alert("เกิดข้อผิดพลาด");
    }
  };
  
  const filteredShops = shops.filter((shop) => {
    if (!searchTerm) return true;
    const shopName = shop.shopName?.toLowerCase() || "";
    const shopType = shop.type?.toLowerCase() || "";
    const searchLower = searchTerm.toLowerCase();
    return shopName.includes(searchLower) || shopType.includes(searchLower);
  });

  if (loading) return <div className="card" style={{ maxWidth: 960, margin: '2rem auto 0 auto' }}><p>กำลังโหลด...</p></div>;
  if (error) return <div className="card" style={{ maxWidth: 960, margin: '2rem auto 0 auto' }}><p className="error-text">{error}</p></div>;

  return (
    <>
      {isArchiveModalOpen && (
        <div style={modalOverlayStyle} onClick={handleModalClose}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h2 className="title">เหตุผลในการซ่อนร้านค้า</h2>
            <div className="form-group" style={{marginTop: '1rem'}}>
              <textarea rows="4" value={archiveReason} onChange={(e) => setArchiveReason(e.target.value)} style={{width: '100%'}} placeholder="ระบุเหตุผล (บังคับ)" />
            </div>
            <div style={{display: 'flex', gap: 12, marginTop: 16}}>
              <button className="btn primary" onClick={handleConfirmArchive} style={{background: 'var(--danger)'}}>ยืนยันการซ่อน</button>
              <button className="btn" onClick={handleModalClose}>ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
      
      <div className="card" style={{ maxWidth: 960, margin: '2rem auto 0 auto' }}>
        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <h2 className="title">{userRole === 'admin' ? 'จัดการสถานที่ทั้งหมด' : 'สถานที่ของฉัน'}</h2>
          <p className="lead">พบ {filteredShops.length} รายการ (ไม่รวมที่เก็บถาวร)</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <input 
            type="text" 
            placeholder="🔍 ค้นหาด้วยชื่อร้าน หรือประเภท..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '1rem' }}
          />
        </div>

        <div className="form" style={{ gap: '1rem' }}>
          {filteredShops.length === 0 && (
            <p style={{ textAlign: 'center', color: '#718096', padding: '2rem 0' }}>
              {searchTerm ? 'ไม่พบร้านค้าที่ตรงกับคำค้นหา' : 'ไม่พบข้อมูลในระบบ'}
            </p>
          )}

          {/* ⭐️ เรียกใช้งาน Component ShopCard ตรงนี้ สั้นลงเยอะเลย! ⭐️ */}
          {filteredShops.map((shop) => (
            <ShopCard 
              key={shop.id} 
              shop={shop} 
              userRole={userRole} 
              onArchiveClick={handleArchiveClick} 
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default ShopList;